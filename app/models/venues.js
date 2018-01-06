'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Venue = new Schema({
	id: Object,
	yelpName: String,
	yelpId: String,
	timestamp: Date
});

module.exports = mongoose.model('venues', Venue);