/*
 * 用户模块
 */

var CONFIG = require('../config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

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
		console.log('hh')
	}else{

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

	}else{

	}
}