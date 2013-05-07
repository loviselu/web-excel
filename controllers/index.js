var fs = require('fs');

exports.routes = [
	{
		'pattern': /^(\/|\/index\.html)$/,
		'method': 'get',
		'handler': 'index'
	}
];

exports.index = function (req, res) {
	fs.readFile('excel-editor/index.html', 'utf-8', function (err, data) {
		if (err) {
			console.error(err.message);
			res.end('error');
		} else {
			res.end(data);
		}
	});
};
