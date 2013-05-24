var database = require('../util/database');
var ObjectID = require('mongodb').ObjectID;

/**
 * 创建一个新文档，在callback中返回文档的id
 * @param userId 用户id
 * @param data 文档属性
 * @param callback 参数分别为(err, id)
 */
exports.create = function (userId, data, callback) {
	database.ready(function(db){
		db.collection('document', function (err, document) {
			data['data'] = data['data'] || {};
			data['owner'] =  userId;
			document.insert(data, {w: 1}, function (err, result) {
				if (err) {
					console.error(err.message);
					return callback(err);
				}
				var fileId =  result[0]._id.toString();
				db.collection('user', function (err, user) {
					user.update({_id:ObjectID(userId)}, {$push:{my_files:fileId}}, function (err, result) {
						if (err) {
							console.error(err.message);
							return callback(err);
						}
						return callback(null,fileId);
					});
				});
			});
		})
	})
};

/**
 * 通过指定id取出文档
 * @param userId 用户id
 * @param fileId
 * @param callback  参数分别为(err, data)
 */
exports.get = function (userId, fileId, callback) {
	database.ready(function(db) {
		db.collection('document', function (err, collection) {
			if (typeof fileId === 'string' && fileId.length === 24) {
				collection.findOne({_id: new ObjectID(fileId)}, function (err, result) {
					if (err) {
						console.error(err.message);
						return callback(err);
					}
					//todo 添加权限管理
					return callback(null, result);
				});

			} else {
				return callback(new Error('fileId invalid'));
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
 *          "before":{"value":"123","fomula":"sdfsd"},
 *          "now":{"value":"123","fomula":"sdfsd"}
 *      }
 *  }
 *
 * result格式如下：
 * ｛
 *   "code": -1 (0表示成功，-1表示有冲突)
 *   "conflict" :["2B","3C"]
 * ｝
 * @param userId 用户id
 * @param fileId
 * @param data
 * @param callback 参数分别为(err, result)
 */
exports.update = function (userId, fileId, data, callback) {
	database.ready(function (db) {
		db.collection('document', function (err, collection) {
			collection.findOne({_id: new ObjectID(fileId)}, function (err, result) {
				if (err) {
					console.error(err.message);
					return callback(err);
				}
				if (!result) {
					return callback(new Error("Document not found!"));
				}
				//todo 检测是否有权限

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


