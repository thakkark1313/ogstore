var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
global.userid="";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
      res.render('register', { });
  });

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username, email : req.body.email, phone : req.body.phone }), req.body.password, function(err, account) {        
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {            
            var result = {
                username : req.body.username,
                email : req.body.email,
                phone : req.body.phone    
            }
            res.json(result);
        });
    });
});

router.get('/login', function(req, res) {
      res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
      res.redirect('/');
  	  global.userid = req.body.username;
});

router.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
});

router.get('/ping', function(req, res){
      res.send("pong!", 200);
});

module.exports = router;