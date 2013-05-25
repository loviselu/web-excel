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
		'pattern': '/file/getFileDate',
		'method': 'get',
		'handler': 'getFileDate'
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
 */
exports.getFileDate = function (req, res) {
	fileModel.get(req.session.userId,req.query.fileId, function (err, data) {
		if (err) {
			res.json({code:-1,message:'数据库出错'})
		} else if (data != null) {
			res.json({code:0,data:data})
		} else {
			res.json({code:-2,message:'指定文件不存在'});
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
			user.findOne({_id:ObjectID(req.session.userId)},{my_files:true,share_to_me:true},function(err,result){

				var my_files = result.my_files || [];
				var share_to_me = result.share_to_me || [];
				var recyclebin = [];
				var all_file = Array.prototype.concat(my_files,my_files).map(function(v){return ObjectId(v)});

				db.collection('file', function (err, file) {
					if(err){
						res.json({code:-1,message:"数据库出错"});
						return;
					}
					file.find({_id:{"$in":all_file}},{filename:1,owner:1},function(err,result){
						if(err){
							res.json({code:-1,message:"数据库出错"});
							return;
						}
						for(var i = result.length;i>=0;i--){
							if(result[i].owner === req.seesion.userId){
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
			file.findOne({_id:ObjectID(fileID)},{ownerId:true},function(err,result){
				if(err){
					res.json({'code':-1,message:'数据库出错'});
					return;
				}
				if(result.ownerId !== req.session.userId){
					res.json({'code':-4,message:'无权限修改'});
				}else{
					file.update({_id:ObjectID(fileID)},{'$set':{filename:newName}},function(err,result){
						if(err){
							res.json({'code':-1,message:'数据库出错'});
						}else{
							res.json({'code':0});
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
 */
exports.setAuth = function(req,res){
	var fileID = req.body.fileID,
		readList =  req.body.readList,
		allCanRead =  req.body.allCanRead,
		writeList =  req.body.writeList,
		allCanWrite =  req.body.allCanWrite,
		deferAll = Deferred();


	if(!fileID && fileID.length !== 24 ){
		res.json({'code':-2,message:'fileID不合法'});
		return;
	}
	database.ready(function(db){
		db.collection('file', function (err, file) {
			file.findOne({_id:ObjectID(fileID)},{ownerId:true},function(err,result){
				if(err){
					res.json({'code':-1,message:'数据库出错'});
					return;
				}
				if(result.ownerId !== req.session.userId){
					res.json({'code':-4,message:'无权限修改'});
				}else{
					deferAll.done(function(change){
						file.update({_id:ObjectID(fileID)},change,function(err,result){
							if(err){
								res.json({'code':-1,message:'数据库出错'});
							}else{
								res.json({'code':0});
							}
						})
					})
					if(allCanRead && allCanWrite){
						deferAll.resolve({'$set':{readable_list:'all',writeable_list:'all'}});
					}else{
						//todo 完善权限设置
						deferAll.resolve({'$set':{readable_list:'all',writeable_list:'all'}});
					}
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

}

/*
 * 撤回回收桶文件
 * POST ：
 *  fileID
 */
exports.revertRecycle = function(req,res){

}

/*
 * 删除共享文件
 * POST ：
 *  fileID
 */
exports.removeShareFile = function(req,res){

}


/*
 * 彻底删除文件
 * POST ：
 *  fileID
 */
exports.remove = function(req,res){

}
