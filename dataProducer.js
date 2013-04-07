var CONFIG = require('./config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

/**
 * 创建一个新文档，在callback中返回文档的id
 * @param data 文档属性
 * @param callback 参数分别为(err, id)
 */
exports.create = function (data, callback) {
	MongoClient.connect(CONFIG.DBPATH, function (err, db) {
		if (err) {
			console.error(err.message);
			return callback(err);
		}
		db.collection('document', function (err, collection) {
			data['data'] = data['data'] || {};
			collection.insert(data, {w: 1}, function (err, result) {
				if (err) {
					console.error(err.message);
					return callback(err);
				}
				return callback(null, result[0]._id.toString());
			})
		})
	});
};

/**
 * 通过指定id取出文档
 * @param id
 * @param callback  参数分别为(err, data)
 */
exports.get = function (id, callback) {
	MongoClient.connect(CONFIG.DBPATH, function (err, db) {
		if (err) {
			console.error(err.message);
			return callback(err);
		}
		db.collection('document', function (err, collection) {
			if (typeof id === 'string' && id.length === 24) {
				collection.findOne({_id: new ObjectID(id)}, function (err, result) {
					if (err) {
						console.error(err.message);
						return callback(err);
					}
					return callback(null, result);
				});

			} else {
				return callback(new Error('id invalid'));
			}
		});
	});
};

/**
 * 更新文档，如果有冲突则提示
 *
 * 其中data格式如下：
 * ｛
 *    "2B":
 *      {
 *          "before":"123",
 *          "now":"234"
 *      }
 *  }
 *
 * result格式如下：
 * ｛
 *   "code": -1 (0表示成功，-1表示有冲突)
 *   "conflict" :["2B","3C"]
 * ｝
 *
 * @param id
 * @param data
 * @param callback 参数分别为(err, result)
 */
exports.update = function (id, data, callback) {
	MongoClient.connect(CONFIG.DBPATH, function (err, db) {
		if (err) {
			console.error(err.message);
			return callback(err);
		}
		db.collection('document', function (err, collection) {
			collection.findOne({_id: new ObjectID(id)}, function (err, result) {
				if (err) {
					console.error(err.message);
					return callback(err);
				}
				if (!result) {
					return callback(new Error("Document not found!"));
				}
				//检查是否有冲突
				var conflict = [];
				var newData = {};
				for (var key in data) {
					var flag = true;
					for (var prop in data[key]) {
						if (result['data'][key][prop] && data[key]['before'][prop] !== result['data'][key][prop]) {
							conflict.push(key);
							flag = false;
							break;
						}
					}
					if (flag) {
						newData[key] = data[key]['now'];
					}
				}
				if (conflict.length > 0) {
					return callback(null, {"code": -1, "conflict": conflict});
				}

				collection.update({_id: new ObjectID(id)}, {'data': newData}, {w: 1}, function (err, result) {
					if (err) {
						console.error(err.message);
						return callback(err);
					}
					return callback(null, {"code": 0});
				})
			})
		})
	})
}