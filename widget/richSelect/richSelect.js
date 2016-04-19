String.prototype.replaceAll=function(s1,s2){if(s1.indexOf("$")>-1){var a=this.split(s1);var s=a[0];for(var i=1,c=a.length;i<c;i++)s+=s2+a[i];return s;}else return this.replace(new RegExp(s1,"gm"),s2);}

var _richSelect_currentObj = null;
var _richSelect_currentObj_t = null;
function RichSelect(obj, className, getParam, elementIds, columnNames) {

	if(_richSelect_currentObj!=null){
//		if(_richSelect_currentObj.jObj[0]==obj){
//			this.dataArr = _richSelect_currentObj.dataArr;
//		}else{
//			_richSelect_currentObj.closeDiv();
//		}
		//当鼠标停留在selectInputDown上时，使用TAB键失去焦点并触发另外一个RichSelect时closeDiv()因onDiv为true不会被调用
		if(_richSelect_currentObj.jObj[0]!= obj){
			_richSelect_currentObj.onDiv = false;
		}
		_richSelect_currentObj.closeDiv();
	}
	_richSelect_currentObj = this;
	
	this.onDiv = false;
	// 2014-4-12 史磊
	// 为了解决ie6下显示一次后消失的问题。增加了是否显示的控制。
	// 当前还不知道为什么连续调用show这个方法会导致ie6下的不显示。通过控制不重复调用程序段可以避免这个问题的发生。
	// 后期需要重新制作这个控件，实现太烂了。
	this.isShow = false;
	this.jObj = $(obj);
	this.selectInputDown = $("<div class=\"selectInputDown devSearchInputDown\"><div class=\"paddingCon\"><div class=\"title\"><span><span></span>数据列表</span></div><ul></ul></div></div>").css("z-index",800);
	this.ul = $("ul", this.selectInputDown);
	this.title = $(".title", this.selectInputDown);
	this.paddingCon = $(".paddingCon", this.selectInputDown);
	this.dataArr = null; //从后台的二维数据
	this.exist = false; //数据库中必须存在，否则可以输入数据库中不存在的内容
	this.existAlert = null; //this.exist==true，当空时的提示
	this.validInd = null; //匹配的数据在二维数组中的索引位置
	this.pzindex=this.jObj.parent()[0].style.zIndex;
	this.jObj.parent().css({
		"position": "relative",
		"z-index": "600"
	});
	this.ul.css({
		"height": 200,
		"overflow": "auto"
	});
	
	this.jObj.unbind("input propertychange dblclick").bind('input propertychange dblclick', function() {
		//modify by jyc,2014-3-27,防止频繁访问
		clearTimeout(_richSelect_currentObj_t);
		_richSelect_currentObj_t = window.setTimeout(function(){_richSelect_currentObj.setDataArray();},300);
	}).unbind("blur").bind('blur',function(e) {
		clearTimeout(_richSelect_currentObj_t);
		if (_richSelect_currentObj.onDiv == false) {
			_richSelect_currentObj.selectItem(e);
			_richSelect_currentObj.closeDiv();
		} else {
			//_richSelect_currentObj.jObj.focus();
		}
	});
	this.selectInputDown.mouseenter(function() {
		_richSelect_currentObj.onDiv = true;
	}).mouseleave(function() {
		_richSelect_currentObj.onDiv = false;
		//_richSelect_currentObj.closeDiv();
		_richSelect_currentObj.jObj[0].focus();
	});

	this.showDiv = function() {
		if(!this.isShow){
			this.isShow = true;
		
			//var _top = _richSelect_currentObj.jObj.offset().top+_richSelect_currentObj.jObj.height();
			//var _left = _richSelect_currentObj.jObj.offset().left;
			//_richSelect_currentObj.selectInputDown.css({"top":_top,"left":_left});
			//$("body").append(_richSelect_currentObj.selectInputDown);
			var top = _richSelect_currentObj.jObj.offset().top;
			var o_height = _richSelect_currentObj.jObj.height();
			
			var pageBottom = document.body.clientHeight;
	
			
			_richSelect_currentObj.jObj.after(_richSelect_currentObj.selectInputDown);
			var sel_height = _richSelect_currentObj.selectInputDown.height();
			var bottom = top + o_height + sel_height;
			//		console.log("pageBottom:"+pageBottom);
			//		console.log("top:"+top);
			//		console.log("o_height:"+o_height);
			//		console.log("sel_height:"+sel_height);
			//		console.log("bottom:"+bottom);
			//		console.log("===============================");
			if (pageBottom >= bottom) {
				_richSelect_currentObj.selectInputDown.slideDown();
			} else {
				if ((top - sel_height - 5) <= 0) {
					_richSelect_currentObj.selectInputDown.slideDown();
				} else {
					_richSelect_currentObj.selectInputDown.css({
						"top": (0 - sel_height - 5)
					});
					_richSelect_currentObj.selectInputDown.show();
				}
			}
			//		if(sel_height<_richSelect_currentObj.ul.height()){
			//			_richSelect_currentObj.ul.css({"height":(_richSelect_currentObj.selectInputDown.outerHeight() - _richSelect_currentObj.title.height() - (_richSelect_currentObj.paddingCon.outerHeight() - _richSelect_currentObj.paddingCon.height())*2)});
			//		}
		}
	}
	this.setExist = function(ext, alt, iscAll,_validInd) {
		this.exist = (ext == true);
		this.existAlert = alt || null;
		this.isClearAll = (typeof iscAll == "undefined" || iscAll == true);
		this.validInd = _validInd;
	};
	this.clearAll = function() {
		if (this.isClearAll) {
			this.jObj.val("");
		}
	};
	this.selectItem = function(e) {
		var o = _richSelect_currentObj;
		if (o.exist == true) {
			var v = o.jObj.val();
			if (v != null && v != "") {
				if (o.isInDataArr(v)) {
					if (this.existAlert != null) {
						//@modify by jyc,2014-3-27,弹出提示框后，无法获取焦点
						window.setTimeout(function(){alert("对不起！您输入的“" + v + "”\n" + o.existAlert + "不存在，将被清空！");/*panxin #7102*/_richSelect_currentObj=null},1);
						o.clearAll();
						return;
					} else { //如果输入的不存在，则清空绑定的输入框的值，输入的这个输入框的值不清空
						for (var j = 0; j < elementIds.length; j++) {
							if (elementIds[j] != null) {
								$("#" + elementIds[j]).val("");
							}
						}
					}
				} else {}
			}
		}
		//o.afterSelectFun(o.jObj);
	}
	this.isInDataArr = function(v) {
		var o = _richSelect_currentObj;
		if (o.dataArr == null) {
			return false;
		} else if (o.dataArr.length == 0 || !v) {
			return true; //输入内容不在dataArr中
		} else {
			var _columnIndex;
			if(o.validInd == null){
				for (var i = 0; i < columnNames.length; i++) {
					if (columnNames[i] != null && columnNames[i] != "") {
						_columnIndex = i;
						break;
					}
				}
			} else {
				_columnIndex = o.validInd;
			}
			
			for (var i = 0; i <= o.dataArr.length - 1; i++) {
				if (o.dataArr[i][_columnIndex] == v) {
					$(o.ul).find('li').eq(i).click();
					return false;
				}
			}
			return true; //输入内容不在dataArr中
		}
	}
	//记录是否为空
	/*    this.isEmpty = function(){
        return this.selectDataArr == null || this.selectDataArr.length == 0;
    };*/
	this.afterSelectFun = function() {};
	//选择后的回调函数定义
	this.afterSelectHandler = function(fn) {
		_richSelect_currentObj.afterSelectFun = fn;
	}
	this.setDataArray = function() {
		var param = {
			"className": className
		};
		if (getParam && $.isFunction(getParam)) {
			$.extend(param, getParam());
		}
		var _url = "/priceservice/vrwsajax?ajaxBeanName=richSelect";
		// $.ajax({
		// 	url: _url,
		// 	type: "post",
		// 	dataType: "json",
		// 	data: param,
		// 	success: function(data) {
		// 		var o = _richSelect_currentObj;
		// 		o.dataArr = (data == null || data.list == null) ? [] : data.list;
		// 		o.ul.empty();
		// 		var columnIndex = 0;
		// 		for (var i = 0; i < columnNames.length; i++) {
		// 			if (columnNames[i] != null && columnNames[i] != "") {
		// 				columnIndex = i;
		// 				break;
		// 			}
		// 		}
		// 		o.selectInputDown.find(".paddingCon .title span span").text(columnNames[columnIndex]);
		// 		for (var i = 0; i < o.dataArr.length; i++) {
		// 			var li = $("<li rowIndex=\"" + i + "\"><a href='javascript:'><s></s>" + escapeHTML(o.dataArr[i][columnIndex]) + "</a></li>");
		// 			o.ul.append(li);
		// 			li.click(function() {
		// 				var arr = o.dataArr[parseInt($(this).attr("rowIndex"))];
		// 				for (var j = 0; j < elementIds.length; j++) {
		// 					if (elementIds[j] != null) {
		// 						$("#" + elementIds[j]).val(arr[j] == null ? "" : arr[j]);
		// 					}
		// 				}
		// 				o.afterSelectFun(o.jObj);
		// 				o.onDiv = false;
		// 				o.closeDiv();
		// 				// add by 罗建 解决IE6下不能自动搜索的问题 二次发布项目yjt201406b
		// 				return false;
		// 			});
		// 		}
		// 		o.showDiv();
		// 	}
		// });
			var data = {list:[["打我看的巨大"],["打我看的巨大"],["打我看的巨大"],["打我看的巨大"],["打我看的巨大"],["打我看的巨大"],["打我看的巨大"],["打我看的巨大"]]};
			var o = _richSelect_currentObj;
			o.dataArr = (data == null || data.list == null) ? [] : data.list;
			o.ul.empty();
			var columnIndex = 0;
			for (var i = 0; i < columnNames.length; i++) {
				if (columnNames[i] != null && columnNames[i] != "") {
					columnIndex = i;
					break;
				}
			}
			o.selectInputDown.find(".paddingCon .title span span").text(columnNames[columnIndex]);
			for (var i = 0; i < o.dataArr.length; i++) {
				var li = $("<li rowIndex=\"" + i + "\"><a href='javascript:'><s></s>" + (o.dataArr[i][columnIndex]) + "</a></li>");
				o.ul.append(li);
				li.click(function() {
					var arr = o.dataArr[parseInt($(this).attr("rowIndex"))];
					for (var j = 0; j < elementIds.length; j++) {
						if (elementIds[j] != null) {
							$("#" + elementIds[j]).val(arr[j] == null ? "" : arr[j]);
						}
					}
					o.afterSelectFun(o.jObj);
					o.onDiv = false;
					o.closeDiv();
					// add by 罗建 解决IE6下不能自动搜索的问题 二次发布项目yjt201406b
					return false;
				});
			}
			o.showDiv();
	}

	this.closeDiv = function() {
		var o = _richSelect_currentObj;
		if (!o.onDiv) {
			o.dataArr = null;
			//o.ul.empty(); //导致IE6关闭；
			//o.ul.find("li").remove();
			o.ul.remove();
			o.selectInputDown.slideUp();
			o.selectInputDown.remove();
			o.jObj.unbind("input propertychange dblclick blur");
			o.jObj.parent().css({
				"z-index":o.pzindex
			});
			//o = null;
			
			//2014-4-12 史磊，关闭窗口时清除，防止多余的代码执行
			clearTimeout(_richSelect_currentObj_t);
			this.isShow = false;
		}
	}
}