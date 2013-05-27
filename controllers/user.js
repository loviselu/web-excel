/*
 * 用户模块
 */

var database = require('../util/database'),
	ObjectID = require('mongodb').ObjectID,
	crypto = require('crypto');

function md5 (text) {
	return crypto.createHash('md5').update(text).digest('hex');
};

exports.routes = [
	{
		'pattern': '/user/login',
		'method': 'get',
		'handler': 'index'
	},
	{
		'pattern': '/user/login',
		'method': 'post',
		'handler': 'login'
	},
	{
		'pattern': '/user/register',
		'method': 'get',
		'handler': 'showRegister'
	},
	{
		'pattern': '/user/register',
		'method': 'post',
		'handler': 'register'
	},
	{
		'pattern': '/user/logout',
		'method': 'get',
		'handler': 'logout'
	}
];


/**
 * 显示登陆页
 * @param req
 * @param res
 */
exports.index = function (req, res) {
	res.render('login');
};

/**
 * 登陆POST请求
 * @param req
 * @param res
 */
exports.login = function (req, res){
	if(req.body.email && req.body.password){
		database.ready( function ( db) {
			db.collection('user', function (err, collection) {
				collection.findOne({email:req.body.email}, function (err, item) {
					if (err) {
						console.error(err.message);
						return callback(err);
					}
					if(item && md5(req.body.password) === item.password){
						req.session.userId = item._id;
						req.session.username = item.username;
						res.cookie('userId',item._id.toString());
						res.cookie('username',item.username);
						res.redirect('/');
					}else{
						res.end('帐号或密码错误');
					}

				})
			})
		});
	}else{
		res.end('请完整填写注册资料');
	}
}

/**
 * 显示注册页
 * @param req
 * @param res
 */
exports.showRegister = function(req,res){
	res.render('register');
}

/**
 * 注册POST请求
 * @param req
 * @param res
 */
exports.register = function(req,res){
	if(req.body.email && req.body.password && req.body.username){
		database.ready(function (db) {
			db.collection('user', function (err, collection) {
				collection.findOne({email:req.body.email}, function (err, item) {
					if (err) {
						console.error(err.message);
						return callback(err);
					}
					if(item){
						res.end('该Email已被注册');
					}else{
						collection.insert({
							email:req.body.email,
							username:req.body.username,
							password:md5(req.body.password)
						},function(err,result){
							collection.findOne({email:req.body.email}, function (err, item){
								req.session.userId = item._id;
								req.session.username = item.username;
								res.cookie('userId',item._id.toString());
								res.cookie('username',item.username);
								res.redirect('/');
							})
						})
					}

				})
			})
		});
	}else{
		res.end('请完整填写注册资料');
	}
}

/**
 * 注销
 * @param req
 * @param res
 */
exports.logout = function (req, res){
	req.session = null;
	res.clearCookie('userId');
	res.clearCookie('username');
	res.redirect('/');
}
