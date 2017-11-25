var express = require('express');
var router = express.Router();

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
    var tempid = 1;// parseInt(req.params.id);    
    var tmp = 1;
    collection.find({userid:tempid}, function(err, cartitems){
        if (err) throw err;     
        var ret = [];                                
        cartitems.forEach(function(cartObj){
        var collection1 = db.get('products');
        collection1.findOne({_id:cartObj.productid},function(err,product){
            if (err) throw err;                        
            for (x in  product)
            {
                //console.log(x);
                //console.log(product[x]);
                if (x == "title" || x == "price" || x == "picture" )
                {                    
                    cartObj[x] = product[x];
                }
            }
            ret.push(cartObj);            
            res.json(ret);
        });    
    });        
        
    });    
        
});


router.post('/addtocart', function(req, res){
    var collection = db.get('cart');
    var tempid = req.body.pid;
    var qty = parseInt(req.body.qty);
    var userid = 1;
    collection.insert({
        userid: userid,
        productid: tempid,
        quantity:qty
    }, function(err, cartObj){
        if (err) throw err;

        res.json(cartObj);
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