var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
global.userid="";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ user : req.user });
});

router.get('/register', function(req, res) {
      res.render('register', { });
});

router.post('/userexists', function(req, res) {    
    Account.findOne({username : req.body.username}, function(err, account) {      
      if(err) {
        res.json({result: false});
        throw err;
      }
      if(account)
        res.json({result: true});
      else
        res.json({result: false});
    });    
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username, email : req.body.email, phone : req.body.phone, isadmin : false }), req.body.password, function(err, account) {        
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {          
          res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {      
      res.render('login', { user : req.user });
});

/*router.post('/login',  function(req, res) { 
      passport.authenticate('local', {session : false}, function(err, user, info) {
        if(!user) {
          res.redirect('/');
        }
      })
      if(err) {
        res.redirect('/'); 
        throw err;
      }      
      res.redirect('/');
  	  global.userid = req.body.username;
});*/

router.post('/login', function(req, res, next) {
    passport.authenticate('local', {session : false},
    function(err, user, info) {
        if (err) {
            return res.json({
                message: "Internal Server Error!"
            })
        } else if (!user) {                    
            return res.json({
                message: "No Such User!"
            })
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.json({
                    message: "Login Failure!"
                })
            }
            res.redirect('/');
            global.userid = req.body.username;            
        });
    })(req, res, next);
});

router.get('/logout', function(req, res) {
      global.userid = '';
      req.logout();
      res.redirect('/');
});

router.get('/ping', function(req, res){
      res.send("pong!", 200);
});

module.exports = router;