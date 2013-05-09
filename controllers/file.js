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

exports.showFileById = function (req, res) {
	db.get(req.params.doc, function (err, data) {
		if (err) {
			console.log(err.message);
			res.redirect(301, '/');
		} else if (data != null) {
			fs.readFile('excel-editor/index.html', 'utf-8', function (err, data) {
				if (err) {
					console.error(err.message);
					res.end('error');
				} else {
					res.end(data);
				}
			});
		} else {
			res.redirect(301, '/');
		}
	});
};