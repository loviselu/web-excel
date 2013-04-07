var CONFIG = require('./config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

function user (name, psd) {
	this.name = name;
	this.psd = psd;
}

user.prototype.get = function (name, cb) {

}

user.prototype.create = function (cb) {
	
}