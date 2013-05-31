var fs = require('fs'),
	fileModel = require('../models/file'),
	database = require('../util/database'),
	ObjectID = require('mongodb').ObjectID,
	index = require('./index'),
	Deferred = require( "JQDeferred"),
	undefined;

exports.routes = [
	{
		'pattern': '/file/newFile',
		'method' : 'post',
		'handler' : 'newFile'
	},
	{
		'pattern': '/file/getFileData',
		'method': 'get',
		'handler': 'getFileData'
	},
	{
		'pattern': '/file/getFileList',
		'method': 'get',
		'handler': 'getFileList'
	},
	{
		'pattern': '/file/rename',
		'method': 'post',
		'handler': 'rename'
	},
	{
		'pattern': '/file/setAuth',
		'method': 'post',
		'handler': 'setAuth'
	},
	{
		'pattern': '/file/getAuth',
		'method': 'get',
		'handler': 'getAuth'
	},
	{
		'pattern': '/file/moveToRecycle',
		'method': 'post',
		'handler': 'moveToRecycle'
	},
	{
		'pattern': '/file/removeShareFile',
		'method': 'post',
		'handler': 'removeShareFile'
	},
	{
		'pattern': '/file/revertRecycle',
		'method': 'post',
		'handler': 'revertRecycle'
	}
	,
	{
		'pattern': '/file/remove',
		'method': 'post',
		'handler': 'remove'
	}
];

/*
 * 新建文档
 * POST : fileName
 */
exports.newFile = function (req, res) {
	var fileName = req.body.fileName;
	var data = req.body.data;
	fileModel.create(req.session.userId,{fileName:fileName,data:data}, function (err, fileId) {
		if (err) {
			res.json({code:-1,message:'数据库出错'})
		} else {
			res.json({code:0,data:{fileId : fileId}})
		}
	});
};

/*
 * 获取文档数据
 * 返回：
 *  {code:0:data:{}}
 *  {code:-1,message:'数据库出错'}
 *  {code:-2,message:'无权限访问'}
 *  {code:-3,message:'文档id不合法'}
 *  {code:-4,message:'指定文档不存在'}
 */
exports.getFileData = function (req, res) {
	fileModel.get(req.session.userId,req.query.fileId, function (err, data) {
		if (err) {
			res.json({code:-1,message:'数据库出错'})
		} else if (data.code === 0) {
			res.json({code:0,data:data})
		} else {
			res.json(data);
		}
	});
};

/**
 *   返回我的文档、共享给我的和回收站的文件
 *   返回格式：
 *   {
 *       "myFile":[
 *          {
 *              fileId:'asgadsg',
 *              fileName:'adsgdgf'
 *          }
 *        ],
 *        "shareToMe":[
 *          {
 *              fileId:'asgadsg',
 *              fileName:'adsgdgf'
 *          }
 *        ],
 *        "recyclebin":[]
 *   }
 */
exports.getFileList = function(req,res){
	database.ready(function(db){
		db.collection('user', function (err, user) {
			if(err){
				res.json({code:-1,message:"数据库出错"});
				return;
			}
			if(!req.session.userId){
				res.json({code:-2,message:"用户未登陆"});
				return;
			}
			user.findOne({_id:ObjectID(req.session.userId)},{my_files:true,share_to_me:true},function(err,result){

				var my_files = [];
				var share_to_me = [];
				var recyclebin = [];
				var all_file = Array.prototype.concat(result.my_files || [],result.share_to_me || []).map(function(v){return ObjectID(v)});

				db.collection('file', function (err, file) {
					if(err){
						res.json({code:-1,message:"数据库出错"});
						return;
					}
					file.find({_id:{"$in":all_file}},{fileName:1,owner:1,in_recyclebin:1}).toArray(function(err,result){
						if(err){
							res.json({code:-1,message:"数据库出错"});
							return;
						}

						for(var i = result.length-1;i>=0;i--){
							if(result[i].owner && result[i].owner === req.session.userId){
								if(result[i].in_recyclebin){
									recyclebin.push(result[i]);
								}else{
									my_files.push(result[i]);
								}
							}else{
								share_to_me.push(result[i]);
							}
						}
						res.json({'code':0,data:{my_files:my_files,share_to_me:share_to_me,recyclebin:recyclebin}});
					});
				});
			})
		})
	})
}

/*
 * 文件重命名
 * POST ： fileID，newName
 * 成功返回｛code：0｝
 */
exports.rename = function(req,res){
	var fileID = req.body.fileID;
	var newName = req.body.newName;
	if(!fileID && fileID.length !== 24 ){
		res.json({'code':-2,message:'fileID不合法'});
		return;
	}
	if(!newName || newName.length > 30){
		res.json({'code':-3,message:'文件名不合法'});
		return;
	}

	database.ready(function(db){
		db.collection('file', function (err, file) {
			file.findOne({_id:ObjectID(fileID)},{owner:1},function(err,result){
				if(err){
					res.json({'code':-1,message:'数据库出错'});
					return;
				}
				if(result.owner !== req.session.userId){
					res.json({'code':-4,message:'无权限修改'});
				}else{
					file.update({_id:ObjectID(fileID)},{'$set':{fileName:newName}},function(err,result){
						if(err){
							res.json({'code':-1,message:'数据库出错'});
						}else{
							res.json({'code':0,message:'修改成功'});
						}
					})
				}
			})
		})
	})
}

/*
 * 给文件设定权限
 * POST ：
 *  fileID
 *  readList
 *  writeList
 *  allCanRead
 *  allCanWrite
 */
exports.setAuth = function(req,res){
	var fileID = req.body.fileID,
		readList =  req.body.readList,
		allCanRead =  req.body.allCanRead === 'true',
		writeList =  req.body.writeList,
		allCanWrite =  req.body.allCanWrite === 'true',
		undefined;


	if(!fileID && fileID.length !== 24 ){
		res.json({'code':-2,message:'fileID不合法'});
		return;
	}
	database.ready(function(db){
		db.collection('file', function (err, file) {
			file.findOne({_id:ObjectID(fileID)},{owner:true},function(err,result){
				if(err){
					res.json({'code':-1,message:'数据库出错'});
					return;
				}

				if(result.owner !== req.session.userId){
					res.json({'code':-4,message:'无权限修改'});
				}else{
					var deferRead = Deferred(),
						deferWrite = Deferred();

					Deferred.when(deferRead,deferWrite).done(function(readResult,writeResutl){
						console.log(readResult)
						console.log(writeResutl)
						var change = {
							$set:{
								'writeable_list': writeResutl,
								'readable_list' : readResult
							}
						}
						file.update({_id:ObjectID(fileID)},change,function(err,result){
							if(err){
								res.json({'code':-1,message:'数据库出错'});
							}else{
								res.json({'code':0});
							}
						})
					}).fail(function(){
						res.json({'code':-1,message:'数据库出错'});
					})

					//处理读权限
					if(allCanRead){
						deferRead.resolve('all')
					}else if(readList === ''){
						deferRead.resolve('none')
					}else{
						readList = readList.split(',');
						console.log(readList);
						db.collection('user', function (err, user) {
							var where = {
								$or:[
									{username:{
										$in:readList
									}},
									{email:{
										$in:readList
									}}
								]
							}
							user.find(where,{_id:true}).toArray(function(err,result){
								if(err){
									deferRead.reject();
								}else{
									console.log(result);
									if(result.length > 0){
										result = result.map(function(v){
											return v._id;
										})
										user.update({_id:{$in:result,$ne:req.session.userId}},{$addToSet:{share_to_me:fileID}},function(err,rusult){});
										deferRead.resolve(result);
									}else{
										deferRead.resolve('none');
									}
								}
							})
						})
					}
					//处理写权限
					if(allCanWrite){
						deferWrite.resolve('all')
					}else if(writeList === ''){
						deferWrite.resolve('none')
					}else{
						writeList = writeList.split(',');
						console.log(writeList);
						db.collection('user', function (err, user) {
							var where = {
								$or:[
									{username:{
										$in:writeList
									}},
									{email:{
										$in:writeList
									}}
								]
							}
							user.find(where,{_id:true}).toArray(function(err,result){
								if(err){
									deferWrite.reject();
								}else{
									console.log(result);
									if(result.length > 0){
										result = result.map(function(v){
											return v._id;
										})
										//设置共享文档
										user.update({_id:{$in:result,$ne:req.session.userId}},{$addToSet:{share_to_me:fileID}},function(err,rusult){});
										deferWrite.resolve(result);
									}else{
										deferWrite.resolve('none');
									}
								}
							})
						})
					}
				}
			})
		})
	})
}

/**
 * 读出文件权限
 * GET ：
 *  fileID
 *
 * return：
 *  readList
 *  writeList
 *  allCanRead
 *  allCanWrite
 */
exports.getAuth = function(req,res){
	fileID = req.query.fileID;
	if(!fileID && fileID.length !== 24 ){
		res.json({'code':-2,message:'fileID不合法'});
		return;
	}

	database.ready(function(db){
		db.collection('file', function (err, file) {
			file.findOne({_id:ObjectID(fileID)},{owner:1,writeable_list:1,readable_list:1},function(err,result){
				if(err){
					res.json({'code':-1,message:'数据库出错'});
					return;
				}
				if(result.owner !== req.session.userId){
					res.json({'code':-4,message:'无权限访问'});
					return;
				}

				var returnData = {
					allCanWrite:false,
					writeList  :[],
					allCanRead:false,
					readList:[]
				};

				var deferWrite = Deferred();
				var deferRead = Deferred();

				Deferred.when(deferWrite,deferRead).done(function(){
					res.json({'code':0,data:returnData});
				}).fail(function(){
					res.json({'code':-1,message:'数据库出错'});
				})

				if(!result.writeable_list || result.writeable_list === 'all'){
					returnData.allCanWrite = true;
					deferWrite.resolve();
				}else if(result.writeable_list === 'none'){
					returnData.writeList = [];
					deferWrite.resolve();
				}else{
					db.collection('user',function(err,user){
						if(err){
							deferWrite.reject();
						}
						user.find({_id:{$in:result.writeable_list}},{username:1}).toArray(function(err,data){
							returnData.writeList = data.map(function(v){
							   return v.username;
						   })
							deferWrite.resolve();
						})
					})
				}

				if(!result.readable_list || result.readable_list === 'all'){
					returnData.allCanRead = true;
					deferRead.resolve();
				}else if(result.readable_list === 'none'){
					returnData.readList = [];
					deferRead.resolve();
				}else{
					db.collection('user',function(err,user){
						if(err){
							deferRead.reject();
						}
						user.find({_id:{$in:result.readable_list}},{username:1}).toArray(function(err,data){
							returnData.readList = data.map(function(v){
								return v.username;
							})
							deferRead.resolve();
						})
					})
				}

			})
		})
	})
}

/*
 * 将文件移到回收桶
 * POST ：
 *  fileID
 */
exports.moveToRecycle = function(req,res){
	var fileID = req.body.fileID;
	if(!fileID && fileID.length !== 24 ){
		res.json({'code':-2,message:'fileID不合法'});
		return;
	}

	database.ready(function(db){
		db.collection('file', function (err, file) {
			file.findOne({_id:ObjectID(fileID)},{owner:1},function(err,result){
				if(err){
					res.json({'code':-1,message:'数据库出错'});
					return;
				}
				if(result.owner !== req.session.userId){
					res.json({'code':-4,message:'无权限修改'});
				}else{
					file.update({_id:ObjectID(fileID)},{'$set':{in_recyclebin:true}},function(err,result){
						if(err){
							res.json({'code':-1,message:'数据库出错'});
						}else{
							res.json({'code':0,message:'修改成功'});
						}
					})
				}
			})
		})
	})
}

/*
 * 撤回回收桶文件
 * POST ：
 *  fileID
 */
exports.revertRecycle = function(req,res){
	var fileID = req.body.fileID;
	if(!fileID && fileID.length !== 24 ){
		res.json({'code':-2,message:'fileID不合法'});
		return;
	}

	database.ready(function(db){
		db.collection('file', function (err, file) {
			file.findOne({_id:ObjectID(fileID)},{owner:1},function(err,result){
				if(err){
					res.json({'code':-1,message:'数据库出错'});
					return;
				}
				if(result.owner !== req.session.userId){
					res.json({'code':-4,message:'无权限修改'});
				}else{
					file.update({_id:ObjectID(fileID)},{'$set':{in_recyclebin:false}},function(err,result){
						if(err){
							res.json({'code':-1,message:'数据库出错'});
						}else{
							res.json({'code':0,message:'修改成功'});
						}
					})
				}
			})
		})
	})
}

/*
 * 删除共享文件
 * POST ：
 *  fileID
 */
exports.removeShareFile = function(req,res){
	var fileID = req.body.fileID;

	if(!fileID && fileID.length !== 24 ){
		res.json({'code':-2,message:'fileID不合法'});
		return;
	}

	database.ready(function(db){
		db.collection('user', function (err, user) {
			user.update({_id:ObjectID(req.session.userId)},{$pull:{share_to_me:fileID}},function(err){
				if(err){
					res.json({'code':-1,message:'数据库出错'})
				}else{
					res.json({'code':0,message:'删除成功'});
				}
			})
		})
	})
}


/*
 * 彻底删除文件
 * POST ：
 *  fileID
 */
exports.remove = function(req,res){
	var fileID = req.body.fileID;
	if(!fileID && fileID.length !== 24 ){
		res.json({'code':-2,message:'fileID不合法'});
		return;
	}

	database.ready(function(db){
		db.collection('file', function (err, file) {
			file.findOne({_id:ObjectID(fileID)},{owner:1},function(err,result){
				if(err){
					res.json({'code':-1,message:'数据库出错'});
					return;
				}
				if(result.owner !== req.session.userId){
					res.json({'code':-4,message:'无权限修改'});
				}else{
					file.remove({_id:ObjectID(fileID)},function(err,result){
						if(err){
							res.json({'code':-1,message:'数据库出错'});
						}else{
							db.collection('user', function (err, user) {
								user.update({_id:ObjectID(req.session.userId)},{$pull:{my_files:fileID}},function(err){
									if(err){
										res.json({'code':-1,message:'数据库出错'})
									}else{
										res.json({'code':0,message:'删除成功'});
									}
								})
							})
						}
					})
				}
			})
		})
	})
}
