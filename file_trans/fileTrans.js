var util = require('util'),
    fs = require('fs');
var xlsx = require('./lib/node-xlsx');


exports.build = function(json){
	console.log(json);
	//var sheetData = JSON.parse('{"sheetId":null,"name":"sheet1","data":[["1","","3"],"",["4"],["","","5"]]}');
	var sheetData = JSON.parse(json);
	var buffer = xlsx.build({worksheets: [
	  {"name":sheetData.name, "data":sheetData.data}
	]});
	fs.writeFileSync('/web-excel/file_trans/'+sheetData.name+'.xlsx',buffer);
	return sheetData.name;
}
exports.parse = function(path){
	var docData = xlsx.parse(path);
	docData = docData.worksheets[0];
	var returnJSON = '{"sheetId":"","sheetName":"'+docData.name+'","data":[',
		cellsC = '',
		cellsA = '';
	var i,j;
	for(i=0;i<docData.data.length;i++){
		if(docData.data[i].length!=0){
			cellsC = '';
			for(j=0;j<docData.data[i].length;j++){
				cellsC=cellsC+',"'+docData.data[i][j].value+'"';
			}
			cellsC=',['+cellsC.substr(1)+']';
		}else{
			cellsC=',[]';
		}	
		cellsA+=cellsC;
	}
	cellsA=cellsA.substr(1)+']';
	returnJSON=returnJSON+cellsA+'}';;
	return returnJSON;
}

