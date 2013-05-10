var http = require('http'),
	https = require('https'),
	express = require('express'),
	fs = require('fs'),
	path = require('path'),
	db = require('./models/dataProducer.js'),
	ws = require('ws').Server,
	app = express(),
	wss = new ws({port: 8080}),
	connections = {};

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals({
	title: '三联表格'
})

app.use('/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/images', express.static(__dirname + '/public/images'));
app.use('/excel-editor', express.static(__dirname + '/excel-editor'));
app.use('/themes', express.static(__dirname + '/excel-editor/themes'));

app.use(express.cookieParser('secret'));
app.use(express.cookieSession());
app.use(express.bodyParser());

//加载控制器
var controllers = ['user', 'index', 'file'];
controllers.forEach(function (v) {
	var controller = require('./controllers/' + v);
	controller.routes.forEach(function (route) {
		app[route.method](route.pattern, controller[route.handler]);
	})
});

wss.on('connection', function (socket) {
	//获取文档名
	var docID = socket.upgradeReq.url.slice(1);
	//创建新链接管理或加入socket列表
	if (docID != '' && connections[docID] instanceof Object) {
		connections[docID].length++;
	} else {
		connections[docID] = {};
		connections[docID].socketList = [];
		connections[docID].length = 1;
	}
	var doc = connections[docID];
	socket.id = doc.socketList.push(socket) - 1;
	console.log(connections);

	/* message 数据结构
	 * {
	 *		code : 1 (文档操作) | 0 (聊天),
	 *  	data : data
	 * }
	 *
	 * 成功建立链接
	 * {
	 *		code : 2
	 *		data : {title : 'title', count : 2}
	 * }
	 *
	 * 成功
	 * {
	 *		code : 1 | 0
	 * }
	 *
	 * 冲突时返回 data 数据结构
	 * {
	 *		code : -1,
	 *		conflict : conflict
	 * }
	 *
	 * 数据操作失败
	 * {
	 * 		'code' : -2,
	 *		'error' : '同步失败'
	 * }
	 *
	 * 参数错误
	 * {
	 * 		'code' : -3,
	 *		'error' : '参数错误'
	 * }
	 *
	 *
	 * 系统错误
	 * {
	 * 		'code' : -4,
	 *		'error' : '系统错误'
	 * }
	 */
	socket.on('message', function (message) {
		console.log('received: %s', message + ' from Doc:' + docID + ' User:' + this.id);
		try {
			message = JSON.parse(message);
		} catch (e) {
			console.log(e);
			return socket.send('{"code" : -3, error : "参数错误"}');
		}
		if (message.type !== undefined && message.type == 1) {
			db.update(docID, message.data, function (err, data) {
				if (err) {
					console.error(err.message);
					socket.send('{"code" : -2, error : "同步失败"}');
				} else {
					console.log(JSON.stringify(data, null, 4));
					if (data.code == -1) {
						//冲突
						socket.send(JSON.stringify(data));
					} else {
						//文档更新广播
						socket.send('{"code" : 1}');
						broadcast(socket, doc, JSON.stringify(data));
					}
				}
			});
		} else {
			//聊天广播
			socket.send('{"code" : 0}');
			message.data.user = socket.id;
			broadcast(socket, doc, JSON.stringify(message));
		}
	});

	socket.on('close', function () {
		doc.socketList[this.id] = undefined;
		if (--doc.length === 0) {
			delete connections[docID];
		}
		console.log(connections);
	});

	db.get(docID, function (err, data) {
		if (err) {
			console.error(err.message);
			socket.send('{"code" : -4, error : "系统错误"}');
		} else {
			console.log(JSON.stringify(data, null, 4));
			socket.send(JSON.stringify({"code": 2, "data": {"title": data.data.sheetId, "count": doc.length - 1}}));
			broadcast(socket, doc, JSON.stringify({"code": 3, "data": {"count": doc.length - 1}}));
		}
	});
});

// var options = {
// 	key: fs.readFileSync("test/server.key"),
// 	cert: fs.readFileSync("test/server.crt"),
// 	ca: fs.readFileSync("test/ca.crt"),
// 	requestCert: true,
// 	rejectUnauthorized: true 
// };

http.createServer(app).listen(3000);
//https.createServer(options, app).listen(443);

function broadcast(socket, doc, message) {
	for (var i = 0; i < doc.socketList.length; i++) {
		if (doc.socketList[i] && doc.socketList[i] !== socket) {
			doc.socketList[i].send(message);
		} else {
			continue;
		}
	}
}