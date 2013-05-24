var fs = require('fs'),
	fileModel = require('../models/file'),
	database = require('../util/database'),
	ObjectID = require('mongodb').ObjectID,
	index = require('./index'),
	undefined;

exports.routes = [
	{
		'pattern': '/file/newFile',
		'mothod' : 'post',
		'handler' : 'newFile'
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
	},
	{
		'pattern': '/file/remove',
		'method': 'post',
		'handler': 'getFileList'
	},
	{
		'pattern': '/file/getFileList',
		'method': 'get',
		'handler': 'getFileList'
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
	fileModel.get(req.session.userId,req.query.doc, function (err, data) {
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
 *        "recycle":[]
 *   }
 */
exports.getFileList = function(req,res){
	database.ready(function(db){
		db.collection('user', function (err, collection) {
			collection.findOne({_id:ObjectID(req.session.userId)},{my_files:true,share_to_me:true},function(err,result){
				res.json({'code':0,data:{my_files:result.my_files,share_to_me:result.share_to_me}});
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
	if(!fileID && fileID.length !== 24 ){
		res.json({'code':-1,message:'fileID不合法'});
		return;
	}

	database.ready(function(db){
		db.collection('file', function (err, collection) {
			collection.findOne({_id:ObjectID(fileID)},{document:true},function(err,document){
				res.json({'code':0,data:document});
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
