'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var User = new Schema({
	id: Object,
	username: String,
	password: String,
	facebook: {
		id: Number,
		token: String,
		name: String
	},
	history: [{
		yelpId: String,
		status: String,
		statusTs: Date
	}],
	timestamp: Date
});

User.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

User.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('users', User);