'use strict';

var express = require('express');
var router = express.Router();

router.get('/login', function(req,res) {

	var obj = {
		message: req.flash('message')
	};
	
	res.render('login',obj);
});

module.exports = router;