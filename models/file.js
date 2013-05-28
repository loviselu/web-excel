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
			data['data'] = data['data']?JSON.parse(data['data']) : {};
			data['data']['cells'] = data['data']['cells'] || {};
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
						return callback(err,{code:-1,message:'数据库出错'});
					}
					if(!result){
						return callback(null,{code:-4,message:'指定文档不存在'});
					}
					if(result.owner === userId
						|| !result.readable_list
						|| result.readable_list === 'all'
						|| result.readable_list.indexOf(userId) > -1
						|| !result.writeable_list
						|| result.writeable_list === 'all'
						|| result.writeable_list.indexOf(userId) > -1){
						return callback(null, result);
					}else{
						return callback(null,{code:-2,message:'无权限访问'});
					}
				});

			} else {
				return callback(null,{code:-3,message:'文档id不合法'});
			}
		});
	});
};

/**
 * 更新文档，如果有冲突则提示
 *
 * 其中data格式如下：
 * {"cell":
 *  {"A1":
 *      {
 *      "old":{"f":"undefined","fs":"0|1|10|#000000|false|false|false|general|bottom"},
 *      "now":{"f":"单元格1","fs":"1|1|10|#000000|false|false|false|left|bottom"}
 *      }
 *   }
 *  }
 *
 * result格式如下：
 * ｛
 *   "code": -1 (0表示成功，-1表示有冲突,-2表示数据库错误，-3表示没有写权限，-4表示文档不存在,-5表示文档id不合法)
 *   "data" :{
 *      key:"2B",
 *      present:{"f":"sss","fs":"0|1|10|#000000|false|false|false|general|bottom"},
 *      old:{"f":"undefined","fs":"0|1|10|#000000|false|false|false|general|bottom"},
 *    }
 * ｝
 * @param userId 用户id
 * @param fileId
 * @param data
 * @param callback 参数分别为(err, result)
 */
exports.update = function (userId, fileId, data, callback) {
	if(fileId != null && 'number' != typeof fileId && (fileId.length != 12 && fileId.length != 24)){
		callback(null,{'code':-5,message:'fileID不合法'});
		return;
	}
	database.ready(function (db) {
		db.collection('file', function (err, collection) {
			collection.findOne({_id: new ObjectID(fileId)},{owner:1,writeable_list:1,data:1}, function (err, result) {
				if (err) {
					console.error(err.message);
					return callback(err,{code:-2,message:'数据库出错'});
				}
				if (!result) {
					return callback(null,{code:-4,message:'指定文档不存在'});
				}
				if(result.owner === userId
					|| !result.writeable_list
					|| result.writeable_list === 'all'
					|| result.writeable_list.indexOf(userId) > -1 ){
					//检查是否有冲突
					var conflict,
						newData;

					for (var key in data['cell']) {

						//冲突判断只判断单元格的值f
						if (result['data']['cells'][key]
							&& data['cell'][key]['old']['f'] !== result['data']['cells'][key]['f']
							&& data['cell'][key]['now']['f'] !== result['data']['cells'][key]['f']) {
							conflict = {key:key,present:result['data']['cells'][key]};
						}else{
							newData = {key:key,present:data['cell'][key]['now'],old:result['data']['cells'][key]};
						}
					}

					if (conflict) {
						return callback(null, {"code": -1, "data": conflict});
					}

					var update = {};

					update['data.cells.'+newData.key] = newData.present;

					collection.update({_id: new ObjectID(fileId)}, {$set:update}, {w: 1}, function (err, result) {
						if (err) {
							console.error(err.message);
							return callback(err,{code:-2,message:'数据库出错'});
						}
						return callback(null, {"code": 0,"data":newData});
					})
				}else{
					return callback(null,{code:-3,message:'无写权限'});
				}
			})
		})
	})
}


