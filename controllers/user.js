/*
 * 用户模块
 */


exports.routes = [
	{
		'pattern': '/user/login',
		'method': 'get',
		'handler': 'index'
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