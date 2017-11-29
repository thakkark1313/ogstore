var express = require('express');
var router = express.Router();

var async = require('async');

var monk = require('monk');
var db = monk('localhost:27017/ogstore');

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

router.get('/:id',function(req,res){
	var collection = db.get('products');
	collection.findOne({_id:req.params.id},function(err,product){
		if (err) throw err;
		res.json(product);
	});
});
module.exports = router;