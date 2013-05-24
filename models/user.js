var database = require('../util/database');
var ObjectID = require('mongodb').ObjectID;

/**
 * 通过指定id取出用户文档列表
 * @param userId 用户id
 * @param callback  参数分别为(err, data)
 */
exports.getFileLIst = function (userId, callback) {
	database.ready(function(db){
		db.collection('user', function (err, collection) {

		})
	})
};

