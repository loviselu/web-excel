var util = require('util'),
    fs = require('fs');
var xlsx = require('./lib/node-xlsx');


exports.build = function(json){
	//var sheetData = JSON.parse('{"sheetId":null,"name":"sheet1","data":[["1","","3"],"",["4"],["","","5"]]}');
	var sheetData = JSON.parse(json);
	var buffer = xlsx.build({worksheets: [
	  {"name":sheetData.name, "data":sheetData.data}
	]});
	fs.writeFileSync('/web-excel/file_trans/'+sheetData.name+'.xlsx',buffer);
	return sheetData.name;
}

