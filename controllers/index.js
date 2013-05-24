var fs = require('fs');

exports.routes = [
	{
		'pattern': [/^(\/|\/index\.html)$/,'/doc/:doc'],
		'method': 'get',
		'handler': 'index'
	}
];

exports.index = function (req, res) {
	if(req.session.userId){
		fs.readFile('excel-editor/index.html', 'utf-8', function (err, data) {
			if (err) {
				console.error(err.message);
				res.end('error');
			} else {
				res.end(data);
			}
		});
	}else{
		res.redirect('/user/login')
	}

};
