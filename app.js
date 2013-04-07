var express = require('express'), 
	fs = require('fs'), 
	path = require('path'), 
	crypto = require('crypto'),
	db = require('./dataProducer.js'), 
	ws = require('ws').Server, 
	//util = require('util'),
	app = express(), 
	wss = new ws({port: 8080}), 
	connections = {};

app.use('/excel-editor', express.static(__dirname + '/excel-editor'));
app.use('/themes', express.static(__dirname + '/excel-editor/themes'));

app.get(/^\/|\/index\.html/, function (req, res) {
	fs.readFile('excel-editor/index.html', 'utf-8', function(err, data){
		if (err) {
			console.error(err.message);
			res.end('error');
		} else {
			res.end(data);
		}
	});
});

app.get('/:doc', function (req, res) {
	if (!db.get(req.params.doc)) {
		res.redirect('/');	
	} else {
		fs.readFile('excel-editor/index.html', 'utf-8', function(err, data){
			if (err) {
				console.error(err.message);
				res.end('error');
			} else {
				res.end(data);
			}
		});
	}
});

// app.post('/register', function (req, res) {
// 	if (req.body.psd2 != req.body.psd) {
// 		return res.send({'code' : -1, message : '两次输入密码不一致'});
// 	}

// 	var md5 = crypto.createHash('md5');
// 	var password = md5.update(req.body.psd).digest('base64');
// });

// app.post('/login', function (req, res) {

// });

wss.on('connection', function(socket) {
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
    socket.on('message', function(message) {
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
	        		console.log(data);
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

    socket.on('close', function() {
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
    		console.log(data);
	    	socket.send(JSON.stringify({"code" : 2, "data" : {"title" : data.data.sheetId, "count" : doc.length - 1}}));
	    	broadcast(socket, doc, JSON.stringify({"code" : 3, "data" : {"count" : doc.length - 1}}));
	    }
    });
});

app.listen(3000);

function broadcast (socket, doc, message) {
	for (var i = 0; i < doc.socketList.length; i++) {
    	if (doc.socketList[i] && doc.socketList[i] !== socket) {
    		doc.socketList[i].send(message);
    	} else {
    		continue;
    	}
    }
}