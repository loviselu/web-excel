/** 
 * 对6excel.js也做出了相应修改，在其中添加了chenjiabin注释
 * @author chenjiabin
 */
function dragCopy(){
	application.grid.selectorBox.fillBox.onmousedown = function(e){
		e?e:e=window.event;
		grid.selecting=true;
		grid.dragCopying = true;
		grid.fire("ActiveCellChange",window.model.activeCell,grid.cellEditor.getValue());
	}; 
 	grid.onmouseup=function(e){
		e?e:e=window.event;
		this.selecting=false;
		this.selectingRow=false;
		this.selectingCol=false;
		if(this.columnResizing){
		  this.resizeColumn();
		}
		if(this.rowResizing){
		  this.resizeRow(e.clientY);
		}
		this.columnResizing=false;
		this.rowResizing=false;
		if(this.dragCopying){		
			var src = model.selection.currentSelection.clone().start;//复制源，下面需序列化，防止src改变需要克隆
			var firstTarget = model.selection.currentSelection.normalize().start;
			var lastTarget = model.selection.currentSelection.normalize().end;//使顺序从小到大
			var formula = application.model.model.getFormula(src.row,src.col);
			var fTemp = formula;
			if(formula&&formula.indexOf('=')==0){
				var tokens = application.getTokens(formula);
				var paramNames = new Array();//公式参数名数组
				var paramAddrs = new Array();//公式参数位置数组
				while(tokens.moveNext()){
					var token=tokens.current();
					if(token.subtype=='range'){
						paramNames.push(token.value);
						paramAddrs.push(application.model.model.namespace.getNameAddress(token.value));
					}
				}
				for(var m = firstTarget.row;m<=lastTarget.row;m++){
					for(var n = firstTarget.col;n<=lastTarget.col;n++){
						fTemp = formula;
						for(var i = 0;i<paramNames.length;i++){
							var dRow = src.row-paramAddrs[i].start.row;//行差值
							var dCol = src.col-paramAddrs[i].start.col;//列差值
							var reParam = new Range({row:m-dRow,col:n-dCol});
							fTemp = fTemp.replace(paramNames[i],application.model.model.namespace.getRangeName(new Range(reParam.start)));
						}
						application.model.model.setFormula(m,n,fTemp);
					}
				}
			}else{
				for(var m = firstTarget.row;m<=lastTarget.row;m++){
					for(var n = firstTarget.col;n<=lastTarget.col;n++){
						application.model.model.setFormula(m,n,formula);
					}
				}
			}
			this.dragCopying = false;
		}
	};
};