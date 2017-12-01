var express = require('express');
var multer = require('multer');
var dir = '../images/';
var async = require('async');
var monk = require('monk');
var db = monk('localhost:27017/ogstore');
var router = express.Router();
var upload = multer({dest: dir}).single('photo');

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
    var tempid = parseInt(req.params.id);
    collection.find({category:tempid}, function(err, products){
        if (err) throw err;               
      	res.json(products);
    });
});

router.get('/cart', function(req, res) {  
    var collection = db.get('cart');  
    var collection1 = db.get('products');      
    var tempid = 1;// parseInt(req.params.id);    
    var tmp = 1;
    var ret = [];   

    
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
                // console.dir(cartObj);
                ret.push(cartObj);                                        
                if (i == cartitems.length)
                {
                    res.json(ret);
                }
            });            
            callback();
        }, function(err) {            
            if (err) return next(err);            
            // res.json(ret);
        });
    }); 
});

router.post('/addtocart', function(req, res){
    var collection = db.get('cart');
    var tempid = req.body.pid;
    var qty = parseInt(req.body.qty);
    var t_userid = 1;
    collection.findOne({productid:tempid},function(err,product){
        if (err) throw err;
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
            }, function(err, obj){
                if (err) throw err;

                res.json(obj);
            });
        }
        else
        {
            collection.insert({
                userid: t_userid,
                productid: tempid,
                quantity:qty
            }, function(err, cartObj){
                if (err) throw err;

                res.json(cartObj);
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

router.post('/addproduct', function(req, res) {
    var collection = db.get('products');
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
                    category: req.body.category.cid,
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
                    /*upload(req, res, function (err) {
                        if (err) {                    
                          console.log(err);
                          return res.status(422).send("an Error occured")
                        }  
                       
                        path = req.file.path;
                        return res.send("Upload Completed for "+ path); 
                    });*/
                    res.json({result: true, message: 'Product Added Successfully'});
            });
        }
    });
});

router.get('/:id',function(req,res){
	var collection = db.get('products');
	collection.findOne({_id:req.params.id},function(err,product){
		if (err) throw err;
		res.json(product);
	});
});

module.exports = router;