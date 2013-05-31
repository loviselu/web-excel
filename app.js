var http = require('http'),
	https = require('https'),
	express = require('express'),
	fs = require('fs'),
	path = require('path'),
	db = require('./models/file.js'),
	fileTrans = require('./file_trans/fileTrans.js'),
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

//接收导入导出文件请求
app.post('/transFile',function(req,res){
	var json = req.body.data;
	var fileName = fileTrans.build(json);
	fs.readFile('/web-excel/file_trans/'+fileName+'.xlsx', 'utf-8', function (err, data) {
		if (err) {
			console.error(err.message);
			res.end('error');
		} else {
			res.end('/file_trans/'+fileName+'.xlsx');
		}
	});
});
app.get('/file_trans/:fileName',function(req,res){
	res.download('./file_trans/'+req.params.fileName);
});
app.post('/transLocalFile',function(req,res){
	var json = fileTrans.parse(req.files.userTransFile.path);
	res.end(json);
});

wss.on('connection', function (socket) {
	//获取文档名
	var docId = socket.upgradeReq.url.slice(1) || 'test';

	//创建新链接管理或加入socket列表
	if (docId != '' && connections[docId] instanceof Object) {
		connections[docId].length++;
	}
	else {
		connections[docId] = {};
		connections[docId].socketList = [];
		connections[docId].length = 1;
	}

	//付给连接id值
	var doc = connections[docId];
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
	 * 断开连接
	 * {
	 *		code : 6 ,
	 *  	data : data
	 * }
	 *
	 * 冲突时返回 data 数据结构
	 * {
	 *		code : -1,
	 *		data : conflict
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

		if (this.userName == '' || this.userName == undefined) {
			user = '游客' + this.id;
		}
		else {
			user = this.userName;
		}
		console.log('received: %s', message + ' from Doc:' + docId + ' User:' + user);

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
					socket.send('{"code":0}');
					message.data.user = socket.id;
					broadcast(socket, doc, JSON.stringify(message));
					break;

				case 1 :
					db.update(socket.userId, docId, message.data, function (err, res) {
						if (err) {
							console.error(err.message);
							socket.send('{"code" : -2, "error" : "数据库出错, 同步失败"}');
						} else {
							console.log(JSON.stringify(res, null, 4));
							switch (res.code) {
								case 0 :
									broadcast(socket, doc, JSON.stringify({"code":1,"data":res.data}));
									break;

								case -1 :
									//冲突
									socket.send(JSON.stringify({"code":-1, "data":res.data}));
									break;

								case -4 :
									//文档不存在
									socket.send('{"code":-4, "error":"文档不存在"}');
									break;

								case -3 :
									//没有权限
									socket.send('{"code":-5, "error":"没有写权限"}');
									break;

								case 1 :
									//文档更新广播
									socket.send('{"code":1}');
									broadcast(socket, doc, JSON.stringify(res));
									break;
							}
						}
					});
					break;

				case 4 :
					if (!message.data.userId) {
						message.data.userName = socket.userName;
						message.data.userId = socket.userId;
					}
					broadcast(socket, doc, JSON.stringify({"code":4, "data": message.data}));
					break;

				case 5 :
					//首次登陆获取用户信息
					socket.userName = COOKIE.get(message.data, "username") || ("游客" + socket.id);
					socket.userId = COOKIE.get(message.data, "userId") || ('youke' + socket.id);
					socket.send(JSON.stringify({"code": 2, "data": {"id" : docId, "count": doc.length - 1}}));
					broadcast(socket, doc, JSON.stringify({"code": 3, "data": {"count": doc.length - 1, "userName": socket.userName}}));
					break;

				default :
					socket.send('{"code":-4, "error":"系统错误"}');
					break;
			}
		}
		else {
			socket.send('{"code":-4, "error":"系统错误"}');
		}
	});

	socket.on('close', function () {
		//通知其他用户
		broadcast(socket, doc, JSON.stringify({"code": 6, "data": {"count": doc.length - 1, "userName": socket.userName, "userId": socket.userId}}));

		--doc.length;

		if (doc.length === 0) {
			delete connections[docId];
		}
		else {
			console.log("connection closed; User: " + socket.userName);
			doc.socketList[this.id] = undefined;
		}

		//清除undefined
		if (doc.length != doc.socketList.length) {

			var temp = [];

			for (var i = 0, l = doc.socketList.length; i < l; i++) {
				if (doc.socketList[i] != undefined) {
					temp.push(doc.socketList[i]);
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
