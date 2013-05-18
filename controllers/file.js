var fs = require('fs'),
	db = require('../models/dataProducer'),
	undefined;

exports.routes = [
	{
		'pattern': '/file/:doc',
		'method': 'get',
		'handler': 'showFileById'
	}
];

//显示文件
exports.showFileById = function (req, res) {
	db.get(req.session.userId,req.params.doc, function (err, data) {
		if (err) {
			console.log(err.message);
			res.redirect(301, '/');
		} else if (data != null) {
			fs.readFile('excel-editor/index.html', 'utf-8', function (err, data) {
				if (err) {
					console.error(err.message);
					res.end('error');
				} else {
					res.set('Content-Type', 'text/html');
					res.end(data);
				}
			});
		} else {
			res.redirect(301, '/');
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
exports.list = function(req,res){

}