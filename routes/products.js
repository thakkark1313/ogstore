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



router.get('/:id',function(req,res){
	var collection = db.get('products');
	collection.findOne({_id:req.params.id},function(err,product){
		if (err) throw err;
		res.json(product);
	});
});
module.exports = router;