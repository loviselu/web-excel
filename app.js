var http = require('http'),
	https = require('https'),
	express = require('express'),
	fs = require('fs'),
	path = require('path'),
	db = require('./models/file.js'),
	ws = require('ws').Server,
	app = express(),
	wss = new ws({port: 8080}),
	connections = {};

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals({
	title: '三联表格'
});

app.use(function (req, res, next) {
	console.log(req.url);
	next();
});

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
	var docID = socket.upgradeReq.url.slice(1) || 'test';

	//创建新链接管理或加入socket列表
	if (docID != '' && connections[docID] instanceof Object) {
		connections[docID].length++;
	}
	else {
		connections[docID] = {};
		connections[docID].socketList = [];
		connections[docID].length = 1;
	}

	//付给连接id值
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
	 * 编辑状态更新
	 * {
	 *		code : 4,
	 *  	data : data
	 * }
	 *
	 * 新协作者加入
	 * {
	 *		code : 3 ,
	 *  	data : data
	 * }
	 *
	 * 用户信息
	 * {
	 *		code : 5 ,
	 *  	data : data
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
		var user;

		if (this.userName == undefined) {
			user = this.id;
		}
		else {
			user = this.userName;
		}
		console.log('received: %s', message + ' from Doc:' + docID + ' User:' + user);

		try {
			message = JSON.parse(message);
		}
		catch (e) {
			console.log(e);
			socket.send('{"code" : -3, error : "参数错误"}');
		}

		if (message.code != undefined) {
			switch (message.code) {
				case 0 :
					//聊天广播
					socket.send('{"code" : 0}');
					message.data.user = socket.id;
					broadcast(socket, doc, JSON.stringify(message));
					break;

				case 1 :
					db.update(socket.userId, message.data, function (err, data) {
						if (err) {
							console.error(err.message);
							socket.send('{"code" : -2, error : "同步失败"}');
						} else {
							console.log(JSON.stringify(data, null, 4));
							if (data.code == -1) {
								//冲突
								socket.send(JSON.stringify({"code" : -1, "data" : data}));
							} else {
								//文档更新广播
								socket.send('{"code" : 1}');
								broadcast(socket, doc, JSON.stringify(data));
							}
						}
					});
					break;

				case 4 :
					broadcast(socket, doc, JSON.stringify({"code": 4, "data": message.data}));
					break;

				case 5 :
					//首次登陆获取用户信息
					socket.userName = COOKIE.get(message.data, "username");
					socket.userId = COOKIE.get(message.data, "userId");
					socket.send(JSON.stringify({"code": 2, "data": {"id" : docID, "count": doc.length - 1}}));
					broadcast(socket, doc, JSON.stringify({"code": 3, "data": {"count": doc.length - 1, "userName": socket.userName}}));
					break;

				default :
					socket.send('{"code" : -4, "error" : "系统错误"}');
					break;
			}
		}
		else {
			socket.send('{"code" : -4, "error" : "系统错误"}');
		}
	});

	socket.on('close', function () {

		--doc.length;

		if (doc.length === 0) {
			delete connections[docID];
		}
		else {
			console.log("connection closed; User: " + socket.userName);
			doc.socketList[this.id] = undefined;
		}

		//清除undefined
		if (doc.length != doc.socketList.length) {

			var temp = [];

			for (var i = 0, l = doc.length; i < l; i++) {
				if (doc[i] != undefined) {
					temp.push(doc[i]);
				}
			}

			for (i = 0, l = temp.length; i < l; i++) {
				temp[i].id = i;
			}

			doc.socketList = temp;
		}

		console.log(connections);
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
		}
	}
}

var COOKIE = {
	get: function(cookie, name) {
        var ret = cookie.match(new RegExp("(?:^|;\\s)" + name + "=(.*?)(?:;\\s|$)"));
        return ret ? ret[1] : "";
    },set: function(cookie, key, value, opt) {
        var _date = new Date(), _domain = opt.domain || "localhost:3000", _path = opt.path || "/", _time_gap = opt.time || 10 * 365 * 24 * 3600 * 1000;
        _date.setTime(_date.getTime() + _time_gap);
        cookie = key + "=" + value + "; path=" + _path + "; domain=" + _domain + "; expires=" + _date.toUTCString();
    },del: function(cookie, key, opt) {
        var _opt = opt || {};
        opt.time = -new Date();
        cookie.set(key, '', opt);
    }
};
