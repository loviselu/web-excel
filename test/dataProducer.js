var dp = require('../dataProducer');

dp.create({title: 'haha'}, function (err, id) {
	console.log(id);
});