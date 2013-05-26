var mongodb = require("mongodb"),
	mongoserver = new mongodb.Server('localhost', '27017', {'auto_reconnect ':1,socketOptions :{'keepAlive':1 }}),
	db_connector = new mongodb.Db('web-excel', mongoserver,{w:1}),
	g_db = null;


db_connector.open(function(err,db){
	g_db = db;
})

exports.ready = function(callback){
	callback(g_db);
}