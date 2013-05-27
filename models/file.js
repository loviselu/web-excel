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
		db.collection('file', function (err, document) {
			data['data'] = data['data'] || {};
			data['owner'] =  userId;
			document.insert(data, {w: 1}, function (err, result) {
				if (err) {
					console.error(err.message);
					return callback({code:-1,message:'数据库出错'});
				}
				var fileId =  result[0]._id.toString();
				db.collection('user', function (err, user) {
					user.update({_id:ObjectID(userId)}, {$push:{my_files:fileId}}, function (err, result) {
						if (err) {
							console.error(err.message);
							return callback({code:-1,message:'数据库出错'});
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
		db.collection('file', function (err, collection) {
			if (typeof fileId === 'string' && fileId.length === 24) {
				collection.findOne({_id: new ObjectID(fileId)}, function (err, result) {
					if (err) {
						return callback({code:-1,message:'数据库出错'});
					}
					if(!result){
						return callback({code:-4,message:'指定文档不存在'});
					}
					if(result.owner !== userId && result.readable_list && (result.readable_list === 'none' || result.readable_list.indexof(userId) === -1) ){
						return callback({code:-2,message:'无权限访问'});
					}else{
						return callback(null, result);
					}
				});

			} else {
				return callback({code:-3,message:'文档id不合法'});
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
		db.collection('file', function (err, collection) {
			collection.findOne({_id: new ObjectID(fileId)}, function (err, result) {
				if (err) {
					console.error(err.message);
					return callback({code:-1,message:'数据库出错'});
				}
				if (!result) {
					return callback({code:-4,message:'指定文档不存在'});
				}
				if(result.owner !== userId && result.writeable_list && (result.writeable_list === 'none' || result.writeable_list.indexof(userId) === -1) ){
					return callback({code:-2,message:'无写权限'});
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
						return callback({code:-1,message:'数据库出错'});
					}
					return callback(null, {"code": 0});
				})
			})
		})
	})
}


