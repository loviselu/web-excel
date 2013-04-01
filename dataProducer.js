var CONFIG = require('./config');
var MongoClient = require('mongodb').MongoClient;

/**
 * 创建一个新文档，在callback中返回文档的id
 * @param callback The callback gets two arguments (err, id)
 */
exports.create = function (data, callback) {
	MongoClient.connect(CONFIG.DBPATH, function (err, db) {
		if (err) {
			console.error(err.message);
			return callback(err);
		}
		db.collection('document', function (err, collection) {
			collection.insert(data, {w: 1}, function (err, result) {
				if (err) {
					console.error(err.message);
					return callback(err);
				}
				return callback(null, result[0]._id);
			})
		})
	});
};

