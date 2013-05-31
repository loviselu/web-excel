$(function(){
	var fileLayout_tmpl = "";
	var myfiles_item_tmpl = "";
	var share_to_me_item_tmpl = "";
	var recyclebin_item_tmpl = "";
	var renameDialog_tmpl = "";
	var shareDialog_tmpl = "";
	var messageDialog_tmpl = "";

	//---------------------------fileLayout_tmpl--------------------------------------------
	fileLayout_tmpl += "<div id=\"fileLayout\">";
	fileLayout_tmpl += "    <div id=\"fileBoard\" style=\"display: none\">";
	fileLayout_tmpl += "        <div class=\"explorerToggle\">";
	fileLayout_tmpl += "	        <span class=\"sbItemExp\"><\/span>";
	fileLayout_tmpl += "	        <span>我的文档<\/span>";
	fileLayout_tmpl += "	        <span class=\"fl_icon_close\"><\/span>";
	fileLayout_tmpl += "        <\/div>";
	fileLayout_tmpl += "        <div class=\"explorer my_files\">";
	fileLayout_tmpl += "	        <div class=\"message\">正在加载中...<\/div>";
	fileLayout_tmpl += "        <\/div>";
	fileLayout_tmpl += "        <div class=\"explorerToggle\">";
	fileLayout_tmpl += "	        <span class=\"sbItemExp sbItemCol\"><\/span>";
	fileLayout_tmpl += "	        <span>共享给我的<\/span>";
	fileLayout_tmpl += "	        <span class=\"fl_icon_close\"><\/span>";
	fileLayout_tmpl += "        <\/div>";
	fileLayout_tmpl += "        <div class=\"explorer share_to_me\" style=\"display: none\">";
	fileLayout_tmpl += "	        <div class=\"message\">正在加载中...<\/div>";
	fileLayout_tmpl += "        <\/div>";
	fileLayout_tmpl += "        <div class=\"explorerToggle\">";
	fileLayout_tmpl += "	        <span class=\"sbItemExp sbItemCol\"><\/span>";
	fileLayout_tmpl += "	        <span>回收站<\/span>";
	fileLayout_tmpl += "	        <span class=\"fl_icon_close\"><\/span>";
	fileLayout_tmpl += "        <\/div>";
	fileLayout_tmpl += "        <div class=\"explorer recyclebin\" style=\"display: none\">";
	fileLayout_tmpl += "	        <div class=\"message\">正在加载中...<\/div>";
	fileLayout_tmpl += "        <\/div>";
	fileLayout_tmpl += "    <\/div>";
	fileLayout_tmpl += "    <div id=\"toggleFB\">";
	fileLayout_tmpl += "        <div class=\"sbCol sbExp\"><\/div>";
	fileLayout_tmpl += "    <\/div>";
	fileLayout_tmpl += "    <div id=\"command_list\" tabIndex=\"-1\">";
	fileLayout_tmpl += "        <div class=\"item js_rename\">重命名<\/div>";
	fileLayout_tmpl += "        <div class=\"item js_setAuth\">设置权限<\/div>";
	fileLayout_tmpl += "        <div class=\"item js_remove\">移到回收站<\/div>";
	fileLayout_tmpl += "    <\/div>";
	fileLayout_tmpl += "    <div class=\"login_in_mask\">";
	fileLayout_tmpl += "        <a href='\/user\/login'>请先登陆<\/a>";
	fileLayout_tmpl += "    <\/div>";
	fileLayout_tmpl += "<\/div>";

	//-------------------------myfiles_item_tmpl---------------------------------------
	myfiles_item_tmpl += "<div class=\"item\" data-fileId=\"<%=id%>\">";
	myfiles_item_tmpl += "    <a class=\"fileName\" href=\"/doc/<%=id%>\"><%=name%><\/a>";
	myfiles_item_tmpl += "    <span class=\"fi_icon_command\"><\/span>";
	myfiles_item_tmpl += "<\/div>";

	//-------------------------share_to_me_item_tmpl---------------------------------------
	share_to_me_item_tmpl += "<div class=\"item\" data-fileId=\"<%=id%>\">";
	share_to_me_item_tmpl += "    <a class=\"fileName\" href=\"/doc/<%=id%>\"><%=name%><\/a>";
	share_to_me_item_tmpl += "    <span class=\"fi_icon_delete js_delete\" title=\"删除显示\"><\/span>";
	share_to_me_item_tmpl += "<\/div>";

	//-------------------------recyclebin_item_tmpl---------------------------------------
	recyclebin_item_tmpl += "<div class=\"item\" data-fileId=\"<%=id%>\">";
	recyclebin_item_tmpl += "    <a class=\"fileName\" href=\"/doc/<%=id%>\"><%=name%><\/a>";
	recyclebin_item_tmpl += "    <span class=\"fi_icon_revert js_revert\" title=\"恢复文件\"><\/span>";
	recyclebin_item_tmpl += "    <span class=\"fi_icon_delete js_delete\" title=\"彻底删除文件\"><\/span>";
	recyclebin_item_tmpl += "<\/div>";

	//-------------------------------renameDialog_tmpl----------------------------------------------
	renameDialog_tmpl += "<div class=\"popupDialog\" id=\"renameDialog\" style=\"display:none\">";
	renameDialog_tmpl += "    <div class=\"head\">";
	renameDialog_tmpl += "        <h3>重命名<\/h3>";
	renameDialog_tmpl += "        <div class=\"icon-close js_close\"><\/div>";
	renameDialog_tmpl += "    <\/div>";
	renameDialog_tmpl += "    <div class=\"body\">";
	renameDialog_tmpl += "        <div class=\"title\">";
	renameDialog_tmpl += "	        <span>要修改为：<\/span>";
	renameDialog_tmpl += "        <\/div>";
	renameDialog_tmpl += "        <input type='text' class=\"input\" name=\"rename\" \/>";
	renameDialog_tmpl += "        <div class=\"bottom\">";
	renameDialog_tmpl += "            <button class='button js_commit'>确定<\/button>";
	renameDialog_tmpl += "            <button class='button js_close'>取消<\/button>";
	renameDialog_tmpl += "        <\/div>";
	renameDialog_tmpl += "    <\/div>";
	renameDialog_tmpl += "<\/div>";

	//-------------------------------shareDialog_tmpl----------------------------------------------
	shareDialog_tmpl += "<div class=\"popupDialog\" id=\"shareDialog\" style=\"display:none\">";
	shareDialog_tmpl += "   <div class=\"head\">";
	shareDialog_tmpl += "       <h3>设置文档读写权限<\/h3>";
	shareDialog_tmpl += "       <div class=\"icon-close js_close\"><\/div>";
	shareDialog_tmpl += "   <\/div>";
	shareDialog_tmpl += "   <div class=\"body\">";
	shareDialog_tmpl += "       <div class=\"title\">";
	shareDialog_tmpl += "	        <span>只读用户:<\/span>";
	shareDialog_tmpl += "	        <span class=\"gray\">( 所有人可读 <input type='checkbox' name='allCanRead' \/> )<\/span>";
	shareDialog_tmpl += "       <\/div>";
	shareDialog_tmpl += "       <textarea class=\"textarea\" name=\"readList\" placeholder=\"输入联系人的名称或者邮件地址，多个名称或地址之间请用英文逗号分隔...\"><\/textarea>";
	shareDialog_tmpl += "       <div class=\"title\">";
	shareDialog_tmpl += "	        <span>可读\/写用户:<\/span>";
	shareDialog_tmpl += "	        <span class=\"gray\">( 所有人可读\/写 <input type='checkbox' name='allCanWrite' \/> )<\/span>";
	shareDialog_tmpl += "       <\/div>";
	shareDialog_tmpl += "       <textarea class=\"textarea\" name=\"writeList\" placeholder=\"输入联系人的名称或者邮件地址，多个名称或地址之间请用英文逗号分隔...\"><\/textarea>";
	shareDialog_tmpl += "       <div class=\"bottom\">";
	shareDialog_tmpl += "	        <button class='button js_commit'>确定<\/button>";
	shareDialog_tmpl += "	        <button class='button js_close'>取消<\/button>";
	shareDialog_tmpl += "       <\/div>";
	shareDialog_tmpl += "   <\/div>";
	shareDialog_tmpl += "<\/div>";

	//-------------------------------messageDialog_tmpl----------------------------------------------
	messageDialog_tmpl += "<div class=\"popupDialog\" id=\"messageDialog\" style=\"display:none\">";
	messageDialog_tmpl += "    <div class=\"head\">";
	messageDialog_tmpl += "        <h3><%=(title || '提示')%><\/h3>";
	messageDialog_tmpl += "        <div class=\"icon-close js_close\"><\/div>";
	messageDialog_tmpl += "    <\/div>";
	messageDialog_tmpl += "    <div class=\"body\">";
	messageDialog_tmpl += "        <div class=\"title\">";
	messageDialog_tmpl += "	        <span><%=message%><\/span>";
	messageDialog_tmpl += "        <\/div>";
	messageDialog_tmpl += "        <div class=\"bottom\">";
	messageDialog_tmpl += "            <button class='button js_confirm'>确定<\/button>";
	messageDialog_tmpl += "        <\/div>";
	messageDialog_tmpl += "    <\/div>";
	messageDialog_tmpl += "<\/div>";

	//编辑模版
	var my_files_item_tmpl_func = template.compile(myfiles_item_tmpl);
	var share_to_me_item_tmpl_func = template.compile(share_to_me_item_tmpl);
	var recyclebin_item_tmpl_func = template.compile(recyclebin_item_tmpl);
	var messageDialog_tmpl_func = template.compile(messageDialog_tmpl);

	//通用函数
	$.fn.autoPosition = function(){
		this.css('left',($(window).width()-this.width())/2);
		this.css('top',($(window).height()-this.height())/2+$('body').scrollTop()+'px');
		return $(this);
	};

	//通用消息框函数
	$.showMessage = function(message,title,callback){
		var messageDialog = $(messageDialog_tmpl_func({message:message,title:title}));
		messageDialog.appendTo(document.body).autoPosition().show();
		$('#messageDialog .js_confirm').one('click',function(){
			$('#messageDialog').remove();
			if(callback){
				callback()
			}
		})
		$('#messageDialog .js_close').one('click',function(){
			$('#messageDialog').remove();
		})
	}

	//弹出层通用操作
	$('body').on('click','.popupDialog .js_close',function(){
		$(this).closest('.popupDialog').hide();
	});

	//输入面板节点
	$(document.body).append($.parseHTML(fileLayout_tmpl));
	$(document.body).append($.parseHTML(shareDialog_tmpl));
	$(document.body).append($.parseHTML(renameDialog_tmpl));

	$('#fileBoard .explorer').height(($(window).height()-124)+'px');

	$(window).on('resize',function(){
		$('#fileBoard .explorer').height(($(window).height()-124)+'px');
	});

	var userLogin = true;

	$('#toggleFB').on('click',function(){
		if($('#fileBoard').is(':visible')){
			$('#fileBoard').hide();
			$('#toggleFB').css('left','0');
			$('#toggleFB .sbCol').toggleClass('sbExp');
			$('#fileLayout .login_in_mask').hide();
		}else{
			$('#fileBoard').show();
			$('#toggleFB').css('left','212px');
			$('#toggleFB .sbCol').toggleClass('sbExp');
			if(!userLogin){
				$('#fileLayout .login_in_mask').show();
			}
		}
	})

	$('#fileBoard .explorerToggle').on('click',function(){
		$('#fileBoard .explorer').hide();
		$('#fileBoard .explorerToggle .sbItemExp').addClass('sbItemCol');
		$(this).next('.explorer').show();
		$(this).find('.sbItemExp').removeClass('sbItemCol');
	})

	//加载json数据

	$.getJSON('/file/getFileList',function(data){
		if(data.code !== 0){
			$('#fileBoard .explorer .message').text('加载失败');
			if(data.code === -2){
				userLogin = false;
			}
			return;
		}

		$('#fileBoard .message').text('暂无文件');

		var my_files = data.data.my_files;
		if(my_files.length >0){
			$('#fileBoard .my_files .message').hide();
			for(var i = my_files.length-1;i>=0;i--){
				$('#fileBoard .my_files').append(my_files_item_tmpl_func({id:my_files[i]._id,name:my_files[i].fileName}));
			}
		}

		var share_to_me = data.data.share_to_me;
		if(share_to_me.length >0){
			$('#fileBoard .share_to_me .message').hide();
			for(var i = share_to_me.length-1;i>=0;i--){
				console.log(share_to_me[i]);
				$('#fileBoard .share_to_me').append(share_to_me_item_tmpl_func({id:share_to_me[i]['_id'],name:share_to_me[i]['fileName']}));
			}
		}

		var recyclebin = data.data.recyclebin;
		if(recyclebin.length >0){
			$('#fileBoard .recyclebin .message').hide();
			for(var i = recyclebin.length-1;i>=0;i--){
				$('#fileBoard .recyclebin').append(recyclebin_item_tmpl_func({id:recyclebin[i]._id,name:recyclebin[i].fileName}));
			}
		}
	})

	//我的文件-操作按钮点击
	$('#fileBoard .my_files').on('click','.fi_icon_command',function(){

		$('#fileBoard .my_files .item').removeClass('activeItem');
		$(this).closest('.item').addClass('activeItem');

		$('#command_list').css({
			top:$(this).position().top + 20 + 'px',
			left:$(this).position().left
		}).show();
		$('#command_list').focus();
		$('#command_list').on('blur',function(){
			$('#command_list').hide();
		})
	});

	//我的文件-操作-重命名
	$('#command_list .js_rename').on('click',function(){
		$('#command_list').hide();
		$('#renameDialog').autoPosition().show();
	})

	//重命名弹窗确认按钮
	$("#renameDialog .js_commit").on('click',function(){
		var newName = $.trim($("#renameDialog input[name=rename]").val());
		var fileID = $('#fileBoard .my_files .activeItem').data('fileid');

		if(newName === ''){
			return;
		}

		//console.log(fileID)
		$.post('/file/rename',{fileID:fileID,newName:newName},function(data){
			$('#renameDialog').hide();
			if(data.code === 0){
				$('#fileBoard .my_files .activeItem .fileName').text(newName);
			}else{
				$.showMessage(data.message,'修改失败');
			}
		})
	})

	//操作-设置权限
	$('#command_list .js_setAuth').on('click',function(){
		$('#command_list').hide();
		var fileID = $('#fileBoard .my_files .activeItem').data('fileid');
		$.get('/file/getAuth',{fileID:fileID},function(result){
			console.log(result);
			if(result.code === 0){
				if(result.data.allCanRead){
					$("#shareDialog input[name=allCanRead]").attr('checked',true);
				}else{
					$("#shareDialog input[name=allCanRead]").attr('checked',false);
				}
				$("#shareDialog textarea[name=readList]").val(result.data.readList.join(','));

				if(result.data.allCanWrite){
					$("#shareDialog input[name=allCanWrite]").attr('checked',true);
				}else{
					$("#shareDialog input[name=allCanWrite]").attr('checked',false);
				}
				$("#shareDialog textarea[name=writeList]").val(result.data.writeList.join(','));
			}else{
				$.showMessage('加载文件权限列表失败');

				$("#shareDialog input[name=allCanRead]").attr('checked',false);
				$("#shareDialog input[name=allCanWrite]").attr('checked',false);
				$("#shareDialog textarea[name=readList]").val('');
				$("#shareDialog textarea[name=writeList]").val('');
			}
			$('#shareDialog').autoPosition().show();
		})
	})

	//权限设定弹窗确定按钮
	$("#shareDialog .js_commit").on('click',function(){

		var fileID = $('#fileBoard .my_files .activeItem').data('fileid');
		var readList =  $("#shareDialog textarea[name=readList]").val();
		var allCanRead =  $("#shareDialog input[name=allCanRead]").is(":checked");
		var writeList =  $("#shareDialog textarea[name=writeList]").val();
		var allCanWrite = $("#shareDialog input[name=allCanWrite]").is(":checked");


		//console.log(fileID)
		var data = {
			fileID:fileID,
			readList:readList,
			allCanRead:allCanRead,
			writeList:writeList,
			allCanWrite:allCanWrite
		}

		$.post('/file/setAuth',data,function(data){
			$('#shareDialog').hide();
			if(data.code === 0){
				$.showMessage('修改成功');
			}else{
				$.showMessage(data.message,'修改失败');
			}
		})
	})

	//共享给我的文件-删除
	$('#fileBoard .share_to_me').on('click','.js_delete',function(){

		var thatItem = $(this).closest('.item');
		var fileID = thatItem.data('fileid');
		var fileName = thatItem.text();

		$.post('/file/removeShareFile',{fileID:fileID},function(data){
			if(data.code === 0){
				thatItem.remove();
				if($('#fileBoard .share_to_me').children().length === 1){
					$('#fileBoard .share_to_me .message').show();
				}
			}else{
				$.showMessage(data.message,'删除失败');
			}
		})
	});

	//操作-移到回收桶
	$('#command_list .js_remove').on('click',function(){
		$('#command_list').hide();
		var fileID = $('#fileBoard .my_files .activeItem').data('fileid');
		var fileName = $('#fileBoard .my_files .activeItem').text();
		$.post('/file/moveToRecycle',{fileID:fileID},function(data){
			if(data.code === 0){
				$('#fileBoard .my_files .activeItem').remove();
				$('#fileBoard .recyclebin .message').hide();
				if($('#fileBoard .my_files').children().length === 1){
					$('#fileBoard .my_files .message').show();
				}
				$('#fileBoard .recyclebin').append(recyclebin_item_tmpl_func({id:fileID,name:fileName}));
			}else{
				$.showMessage(data.message,'删除失败');
			}
		})
	})

	//回收桶-撤回
	$('#fileBoard .recyclebin').on('click','.js_revert',function(){

		var thatItem = $(this).closest('.item');
		var fileID = thatItem.data('fileid');
		var fileName = thatItem.text();

		$.post('/file/revertRecycle',{fileID:fileID},function(data){
			if(data.code === 0){
				thatItem.remove();
				$('#fileBoard .my_files .message').hide();
				if($('#fileBoard .recyclebin').children().length === 1){
					$('#fileBoard .recyclebin .message').show();
				}
				$('#fileBoard .my_files').append(my_files_item_tmpl_func({id:fileID,name:fileName}));

			}else{
				$.showMessage(data.message,'撤回失败');
			}
		})
	});

	//回收桶-彻底删除
	$('#fileBoard .recyclebin').on('click','.js_delete',function(){

		var thatItem = $(this).closest('.item');
		var fileID = thatItem.data('fileid');
		var fileName = thatItem.text();

		$.post('/file/remove',{fileID:fileID},function(data){
			if(data.code === 0){
				thatItem.remove();
				if($('#fileBoard .recyclebin').children().length === 1){
					$('#fileBoard .recyclebin .message').show();
				}
			}else{
				$.showMessage(data.message,'删除失败');
			}
		})
	});
})