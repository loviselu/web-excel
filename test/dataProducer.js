var dp = require('../models/file');

dp.create('gfhfgh',{title: 'haha'}, function (err, id) {
	console.log(id);
	dp.get(id, function (err, data) {
		console.log(data);
	})
	dp.update(id, {"A2": {"before": "34", now: "7"}}, function (err, data) {
		console.log(data);
		dp.get(id, function (err, data) {
			console.log(data);
		});
		dp.update(id, {"A2": {"before": "34", now: "7"}}, function (err, data) {
			console.log(data);
			dp.get(id, function (err, data) {
				console.log(data);
			})
		})
		dp.update(id, {"A2": {"before": "7", now: "34"}}, function (err, data) {
			console.log(data);
			dp.get(id, function (err, data) {
				console.log(data);
			})
		})
	})
});

