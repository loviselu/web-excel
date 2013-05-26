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
	fileLayout_tmpl += "<\/div>";

	//-------------------------myfiles_item_tmpl---------------------------------------
	myfiles_item_tmpl += "<div class=\"item\" data-fileId=\"<%=id%>\">";
	myfiles_item_tmpl += "    <a class=\"fileName\" href=\"\\doc\\<%=id%>\"><%=name%><\/a>";
	myfiles_item_tmpl += "    <span class=\"fi_icon_command\"><\/span>";
	myfiles_item_tmpl += "<\/div>";

	//-------------------------share_to_me_item_tmpl---------------------------------------
	share_to_me_item_tmpl += "<div class=\"item\" data-fileId=\"<%=id%>\">";
	share_to_me_item_tmpl += "    <a class=\"fileName\" href=\"\\doc\\<%=id%>\"><%=name%><\/a>";
	share_to_me_item_tmpl += "    <span class=\"fi_icon_delete\" title=\"删除显示\"><\/span>";
	share_to_me_item_tmpl += "<\/div>";

	//-------------------------recyclebin_item_tmpl---------------------------------------
	recyclebin_item_tmpl += "<div class=\"item\" data-fileId=\"<%=id%>\">";
	recyclebin_item_tmpl += "    <a class=\"fileName\" href=\"\\doc\\<%=id%>\"><%=name%><\/a>";
	recyclebin_item_tmpl += "    <span class=\"fi_icon_revert\" title=\"恢复文件\"><\/span>";
	recyclebin_item_tmpl += "    <span class=\"fi_icon_delete\" title=\"彻底删除文件\"><\/span>";
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
	renameDialog_tmpl += "            <button class='button'>确定<\/button>";
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
	shareDialog_tmpl += "	        <span class=\"gray\">( 所有人可读 <input type='checkbox' \/> )<\/span>";
	shareDialog_tmpl += "       <\/div>";
	shareDialog_tmpl += "       <textarea class=\"textarea\" name=\"readable_list\" placeholder=\"输入联系人的名称或者邮件地址，多个名称或地址之间请用英文逗号分隔...\"><\/textarea>";
	shareDialog_tmpl += "       <div class=\"title\">";
	shareDialog_tmpl += "	        <span>可读\/写用户:<\/span>";
	shareDialog_tmpl += "	        <span class=\"gray\">( 所有人可读\/写 <input type='checkbox' \/> )<\/span>";
	shareDialog_tmpl += "       <\/div>";
	shareDialog_tmpl += "       <textarea class=\"textarea\" name=\"writeable_list\" placeholder=\"输入联系人的名称或者邮件地址，多个名称或地址之间请用英文逗号分隔...\"><\/textarea>";
	shareDialog_tmpl += "       <div class=\"bottom\">";
	shareDialog_tmpl += "	        <button class='button'>确定<\/button>";
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
	messageDialog_tmpl += "            <button class='button'>确定<\/button>";
	messageDialog_tmpl += "            <button class='button js_close'>取消<\/button>";
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
	$.showMessage = function(message,title){
		var messageDialog = $(messageDialog_tmpl_func({message:message,title:title}));
		messageDialog.appendTo(document.body).autoPosition().show();
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

	$('#toggleFB').on('click',function(){
		if($('#fileBoard').is(':visible')){
			$('#fileBoard').hide();
			$('#toggleFB').css('left','0');
			$('#toggleFB .sbCol').toggleClass('sbExp');

		}else{
			$('#fileBoard').show();
			$('#toggleFB').css('left','212px');
			$('#toggleFB .sbCol').toggleClass('sbExp');
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
		if(data.code != '0'){
			$('#fileBoard .explorer .message').text('加载失败');
			return;
		}

		var my_files = data.data.my_files;
		if(my_files.length === 0){
			$('#fileBoard .my_files .message').text('暂无文件');
		}else{
			$('#fileBoard .my_files .message').hide();
			for(var i = my_files.length-1;i>=0;i--){
				$('#fileBoard .my_files').append(my_files_item_tmpl_func({id:my_files[i]._id,name:my_files[i].filename}));
			}
		}

		var share_to_me = data.data.share_to_me;
		if(share_to_me.length === 0){
			$('#fileBoard .share_to_me .message').text('暂无文件');
		}else{
			$('#fileBoard .share_to_me .message').hide();
			for(var i = share_to_me.length-1;i>=0;i--){
				console.log(share_to_me[i]);
				$('#fileBoard .share_to_me').append(share_to_me_item_tmpl_func({id:share_to_me[i]['_id'],name:share_to_me[i]['filename']}));
			}
		}

		var recyclebin = data.data.recyclebin;
		if(recyclebin.length === 0){
			$('#fileBoard .recyclebin .message').text('暂无文件');
		}else{
			$('#fileBoard .recyclebin .message').hide();
			for(var i = recyclebin.length-1;i>=0;i--){
				$('#fileBoard .recyclebin').append(recyclebin_item_tmpl_func({id:recyclebin[i]._id,name:recyclebin[i].filename}));
			}
		}
	})

	//操作按钮点击
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

	//操作-重命名
	$('#command_list .js_rename').on('click',function(){
		$('#command_list').hide();
		$('#renameDialog').autoPosition().show();
	})

	$()

	//操作-设置权限
	$('#command_list .js_setAuth').on('click',function(){
		$('#command_list').hide();
		$('#shareDialog').autoPosition().show();
	})

	//操作-移到回收桶
	$('#command_list .js_remove').on('click',function(){

	})





})