var express = require('express');
var multer = require('multer');
var async = require('async');
var monk = require('monk');
var db = monk('localhost:27017/ogstore');
var router = express.Router();
var storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        cb(null, '../ogstore/public/images/')
    },
    filename: function (req, file, cb) {        
        cb(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
}).single('file');

router.get('/', function(req, res) {    
    var collection = db.get('products');
    collection.find({}, function(err, products){
        if (err) throw err;
      	res.json(products);
    });
});

router.get('/categories', function(req, res) {    
    var collection = db.get('categories');
    collection.find({}, function(err, categories){
        if (err) throw err;
      	res.json(categories);
    });
});

router.get('/categories/:id', function(req, res) { 	
    var collection = db.get('products');    
    var tempid = req.params.id;
    collection.find({category:tempid}, function(err, products){
        if (err) throw err;               
      	res.json(products);
    });
});




router.delete('/cart', function(req, res) {  
    var collection = db.get('cart');          
    collection.remove({_id:req.query.id}, function(err, cartitems)
    {           
        if (err)
        {            
            res.json({result: false, message: 'Error occured while adding product to cart.'});
            throw err;    
        } 
        else
        {

        }
        res.json({result: true, message: 'Successful'});
    }); 
});


router.get('/history', function(req, res) {  
    var collection = db.get('orders');  
    var collection1 = db.get('products');      
    var tempid = global.userid;
    var tmp = 1;
    var ret = [];  
    var total = 0;
    collection.find({userid:tempid}, function(err, orderitems)
    {                       
        if (err) throw err;              
        var i = 0;
        async.forEach(orderitems, function(orderObj,callback) {             
            collection1.findOne({_id:orderObj.productid},function(err,product){                
                i++;
                if (err) throw err;                                        
                for (x in  product)
                {
                    if (x == "title" || x == "price" || x == "picture" )
                    {                    
                        orderObj[x] = product[x];
                    }
                }          
                orderObj["acprice"] = orderObj["price"] * orderObj["quantity"];  
                orderObj["acprice"] = orderObj["acprice"].toFixed(2);
                total += orderObj["acprice"];                
                ret.push(orderObj);                                        
                if (i == orderitems.length)
                {
                    ret["total"] = total;                    
                    res.json(ret);                    
                }
            });            
            callback();
        }, function(err) {            
            if (err) return next(err);                        
        });
    }); 
});


router.get('/cart', function(req, res) {  
    var collection = db.get('cart');  
    var collection1 = db.get('products');      
    var tempid = global.userid;
    var tmp = 1;
    var ret = [];  
    var total = 0;
    collection.find({userid:tempid}, function(err, cartitems)
    {           
            
        if (err) throw err;              
        var i = 0;

        async.forEach(cartitems, function(cartObj,callback) {             
            collection1.findOne({_id:cartObj.productid},function(err,product){                
                i++;
                if (err) throw err;                                        
                for (x in  product)
                {
                    if (x == "title" || x == "price" || x == "picture" )
                    {                    
                        cartObj[x] = product[x];
                    }
                }          
                cartObj["acprice"] = cartObj["price"] * cartObj["quantity"];  
                cartObj["acprice"] = cartObj["acprice"].toFixed(2);
                total += cartObj["acprice"];                
                ret.push(cartObj);                                        
                if (i == cartitems.length)
                {
                    ret["total"] = total;
                    // console.log(total);
                    res.json(ret);
                    // console.dir(json(ret));
                }
            });            
            callback();
        }, function(err) {            
            if (err) return next(err);            
            // res.json(ret);
        });
    }); 
});


router.post('/orders', function(req, res){    
    var collection = db.get('orders');    
    collection.insert({
        userid: global.userid,
        productid: req.body.productid,
        quantity:req.body.quantity,
        price: req.body.price
    }, function(err, orderObj){
        if (err) throw err;
        // console.log("here");
        res.json(orderObj);
    });
});

router.post('/addtocart', function(req, res){
    var collection = db.get('cart');
    var tempid = req.body.pid;
    var qty = parseInt(req.body.qty);    
    var t_userid = global.userid;    
    collection.findOne({productid:tempid},function(err,product){
        if(err) 
        {
            res.json({result: false, message: 'Error occured while adding product to cart.'});
            throw err;               
        }
        if (product)
        {
            collection.update(
            {
                userid: t_userid,
                productid: tempid
            },
            {
                userid:t_userid,                
                productid : tempid,
                quantity: product["quantity"] + qty
            }, function(err, obj)
            {
                if (err)
                {
                    res.json({result: false, message: 'Error occured while adding product to cart.'});
                    throw err;                        
                } 

                res.json({result: true, message: 'Product Added to Cart Successfully'});
            });
        }
        else
        {
            collection.insert({
                userid: t_userid,
                productid: tempid,
                quantity:qty
            }, function(err, cartObj){

                if (err) 
                {
                    res.json({result: false, message: 'Error occured while adding product to cart.'});
                    throw err;
                }

                res.json({result: true, message: 'Product Added to Cart Successfully'});
            });        
        }
    });    
});

router.post('/safedelete', function(req, res) {
    var collection = db.get('products');
    collection.update(
    {
        _id: req.body.productid
    }, 
    {
        $set: {safedelete:true}
    }, 
    function(err, obj) { 
        if(err) {
            res.json({result: false});
            throw err;
        }

        res.json({result: true});
    });  
});

router.post('/undosafedelete', function(req, res) {
    var collection = db.get('products');
    collection.update(
    {
        _id: req.body.productid
    }, 
    {
        $set: {safedelete:false}
    }, 
    function(err, obj) {         
        if(err) {
            res.json({result: false});
            throw err;
        }

        res.json({result: true});
    });  
});

router.post('/editproduct', function(req, res) {    
    var collection = db.get('products');        
    // console.dir(req.body);
    collection.update(
        {
            _id: req.body._id
        },
        {
            $set: {
                title: req.body.title,
                description: req.body.description,
                quantity: req.body.quantity,
                price: req.body.price
            }
        }, 
        function(err, obj) {
            if(err) {
                res.json({result: false});
                throw err;
            }

            res.json({result: true});
    });
});


router.post('/upload', function(req, res) {          
        upload(req,res,function(err){            
            if(err){                
                 res.json({error_code:1,err_desc:err});
                 return;
            }

            res.json({error_code:0,err_desc:null});
    })
});

router.post('/addproduct', function(req, res) {    
    var collection = db.get('products');   
    var newCategoryAdded = false, addProduct = true, newCategoryId='';    
    if(req.body.newcategory != undefined && req.body.newcategory != null && req.body.newcategory != '') {
        var catCollection = db.get('categories');        
        newCategoryAdded = true;
        catCollection.insert({cname: req.body.newcategory}, function(err, catObj) {
            if(err) {
                addproduct = false
                res.json({result: false, message: 'Error occured while adding new category.'})
                throw err;
            }            
            newCategoryId = catObj._id;
        });
    } 
    if(addProduct) {
        collection.findOne({title: req.body.title}, function(err, obj) {
            if(err) {
                res.json({result: false, message: 'Error occured while adding product.'});
                throw err;
            }
            if(obj) {
                res.json({result: false, message: 'Product already exists'});
            }
            else {            
                collection.insert(
                    {
                        title: req.body.title,
                        category: !newCategoryAdded ? req.body.category._id : newCategoryId.toString(),
                        price: req.body.price,
                        quantity: parseInt(req.body.quantity),                                
                        safedelete: false,
                        picture: req.body.picture,            
                        description: req.body.description        
                    }, 
                    function(err, product) {
                        if(err) {
                            res.json({result: false, message: 'Error occured while adding product.'});
                            throw err;               
                        }

                        res.json({result: true, message: 'Product Added Successfully'});
                });
            }
        });
    }    
});

router.get('/:id',function(req,res){
	var collection = db.get('products');
	collection.findOne({_id:req.params.id},function(err,product){
		if (err) throw err;
		res.json(product);
	});
});


/*
router.post('/checkout', function(req, res) {
    var prodCol = db.get('products');
    var orderCol = db.get('orders');        
    // var user = db.get('users');
    // var addCol = db.get('address');
        
});

*/

module.exports = router;