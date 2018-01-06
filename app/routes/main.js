'use strict';

var path = process.cwd();
var searchRouter = require(path + '/app/routes/search.js');
var loginRouter = require(path + '/app/routes/login.js');
var indicateRouter = require(path + '/app/routes/indicate.js');
var registerRouter = require(path + '/app/routes/register.js');

module.exports = function(app,passport) {
    app.set('view engine', 'pug');
    
    app.get('/', function(req,res){
    	//console.log(req.session);
    	if (req.isAuthenticated()) {
    		console.log('authenticated');
    	//	console.log(req.session);
    	//	console.log(req.user);
    	} else {
    		console.log('not logged in');
    	//	console.log(req.session);
    	}
        res.render('index');
    });
    
    app.post('/search', searchRouter);
    app.post('/indicate', isLoggedIn, indicateRouter);
    
    app.get('/login', isNotLoggedIn, loginRouter);
	app.post('/login', passport.authenticate('login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	}));
    app.get('/register', isNotLoggedIn, registerRouter);
	app.post('/register', passport.authenticate('register', {
		successRedirect: '/',
		failureRedirect: '/register',
		failureFlash: true
	}));
    
    app.get('/auth/facebook', passport.authenticate('facebook', { 
      scope : ['public_profile']
    }));
    
    app.get('/auth/facebook/callback',passport.authenticate('facebook', {
    	successRedirect : '/',
        failureRedirect : '/'
    }));
    
    app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
    });
    
    app.use(function(res,req) {
		req.status(404).end("Page Not Found");
	});
    
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.send({redirect: '/login'});
}

function isNotLoggedIn(req, res, next) {
	if (!req.isAuthenticated())
		return next();
	res.redirect('/');
}