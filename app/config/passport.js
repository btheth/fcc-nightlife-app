'use strict';

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/users');

module.exports = function(passport) {
	passport.serializeUser(function (user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
	
	passport.use(new FacebookStrategy({
		clientID: process.env.FB_ID,
		clientSecret: process.env.FB_SECRET,
		callbackURL: process.env.FB_CALLBACK
	}, function(token, refreshToken, profile, done) {
		process.nextTick(function() {
			User.findOne({'facebook.id': profile.id}, function(err,user) {
				if (err)
					return done(err);
					
				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();
					newUser.facebook.id = profile.id;
					newUser.facebook.token = token;
					newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
					
					newUser.save(function(err) {
						if (err)
							throw err;
						
						return done(null, newUser);
					});
				}
			});
		});
	}
	));

	passport.use('register', new LocalStrategy({
		passReqToCallback: true
	},
	function(req, username, password, done) {
		User.findOne({ 'username' : username }, function(err,user) {
			if (err)
				return done(err);
			if (username.length < 1) {
				return done(null, false, req.flash('message','Must enter username'));
			} else if (user) {
				return done(null, false, req.flash('message','Username taken'));
			} else if (username.split('').indexOf(' ') !== -1) {
				return done(null, false, req.flash('message', 'Username can not contain spaces'));
			} else if (password.length < 1) {
				return done(null, false, req.flash('message', 'Password must be at least 1 character'));
			} else if (password !== req.param('passtwo')) {
				return done(null, false, req.flash('message', 'Passwords must match'));
			} else {
				var newUser = new User();
				newUser.username = username;
				newUser.password = newUser.generateHash(password);
				newUser.timestamp = new Date();

				newUser.save(function(err) {
					if (err)
						throw err;
					return done(null, newUser);
				});
			}
		});
	}));

	passport.use('login', new LocalStrategy({
    	passReqToCallback : true
  	},
  	function(req, username, password, done) { 
    	// check in mongo if a user with username exists or not
    	User.findOne({ 'username' :  username }, function(err, user) {
    	    // In case of any error, return using the done method
    	    if (err) return done(err);
    	    // Username does not exist, log error & redirect back
    	    if (!user){
    	      console.log('User Not Found with username '+username);
    	      return done(null, false, req.flash('message', 'User Not found.'));                 
    	    }
    	    // User exists but wrong password, log the error 
    	    if (!user.validPassword(password)){
    	      console.log('Invalid Password');
    	      return done(null, false, req.flash('message', 'Invalid Password'));
        	}
        	// User and password both match, return user from 
        	// done method which will be treated like success
        	return done(null, user);
      		}
    	);
	}));
};