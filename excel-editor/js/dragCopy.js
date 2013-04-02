/** 
 * 对6excel.js也做出了相应修改，在其中添加了chenjiabin注释
 * @author chenjiabin
 */
function dragCopy(){
	window.grid.selectorBox.fillBox.onmousedown = function(e){
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
			//model.selection.currentSelection
			this.dragCopying = false;
		}
	};
};