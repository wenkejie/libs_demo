/**
 * @version 1.0.0
 * @author 施杰锋 2013-10-28
 * @depends jquery-1.9.1.js jquery.ui.core.js jquery.ui.widget.js
 * @description 下拉框，可筛选的select
 * 
 * @option readonly = false
 * @option width 控件总宽
 * @option itemWidth 下拉框的宽度，undefined则自适应内容的宽度，但不小于控件宽
 * @option size 下拉选项的显示行数，超出自动显示滚动条 undefined则自适应内容的高度
 * @option items 选项[{text:'',value:''}] 
 * @see  className 异步数据加载的class Name
 * @see  params 异步数据加载的参数
 * 
 * （当items有数据将不在异步加载）
 * 
 * @event change = function(event,ui){...} 值发生变化后触发。上下键不触发。鼠标hover不触发。
 * @event select = function(event,ui){...} 选择后触发。上下键触发。鼠标hover不触发。
 * @event render = function(event,ui){...} 创建选项时触发。目前render的内容只支持静态内容，绑定事件会有冲突。
 * 
 * @method value(val); val 为 undefined 时表示得到当前值。
 * @method setEmptyVal(); 当使用value方法允许赋值一个下拉数据中不存在的数据，无法对控件已选择的值进行清空，请使用此方法
 * @method add(item,index);index 为 undefined 时添加在最后
 * @method remove(index); 删除行 index 为数字从0计数，否则按值删除
 * @method clear(); 删除所有的项
 * @method wrap(); 得到整个控件最外围的包裹对象
 * 
 */

//var vrwsCommon = new function(){
//	// -100: 未登录
//	// -200: 参数中未指定bean的名称
//	// -300: 缺少bean的xml配置
//	var ajaxDefaults = {
//		    url: './vrwsajax?ajaxBeanName=',
//		    type: 'get',
//		    dataType: 'json',
//		    cache: false
//		};
//	this.ajax = function(beanName, param, success, error, options) {
//	    var o = $.extend({}, ajaxDefaults);
//	    if (options) {
//	        o = $.extend({}, ajaxDefaults, options);
//	    }
//	    if (beanName) {
//	        o.url = o.url + beanName;
//	    }
//	    if (param) {
//	        o.data = param;
//	    }
//	    if (success && $.isFunction(success)) {
//	        o.success = success;
//	    }
//	    if (error && $.isFunction(error)) {
//	        o.error = error;
//	    }
//	    $.ajax(o);
//	};
//}
;
(function($, _undefined) {

	var _seq = 0;
	function seq() {
		return "id_" + _seq;
	}
	function nextSeq() {
		_seq++;
		return seq();
	}

	function Core(widget) {
		var that = this;
		this.itemMap = {};
		this.selectDiv;/* 模拟下拉框的的总html结构 */
		this.input;/*输入框 */
		this.isOpen = false;
		this.isOnDIV = false;
		this.originalKey;/* 记录当前值，用于change的触发判断用。 */
		this.dropDownCon;

		this.init = function() {
			this.selectDiv = $(
					"<div class='nui-form-cell-cnt'><input class='nui-input first' /><i class='nui-form-cell-icon fs12'>&#13783;</i><div class='nui-drop-down'><ul class='nui-select-list'></ul></div></div>")
					.insertAfter(widget.element.hide());
			/* 将输入框加入到div中 */
			this.selectDiv.append(widget.element);
			this.selectDiv.parent().addClass("nui-select");
			this.input= this.selectDiv.find("input.first");
			this.dropDownCon = this.selectDiv.find("div.nui-drop-down");
			this.dropDownCon.hover(function(){
				that.isOnDIV = true;
		    }, function(){
		    	that.isOnDIV = false;
		    	that.close();
		    });
		    this.input.blur(function(){
				if (widget.options.readonly) {
					return true;
				}
				if(!that.isOnDIV){
					that.setByKey(that.selectDiv.find("li.active").attr("key"));
					that.isOnDIV = false;
					that.close();
				}
			});
			this.input.keyup(function(event){
				if (widget.options.readonly) {
					return true;
				}
				switch (event.keyCode) {
			        case $.ui.keyCode.ENTER:// enter
			        	that.setByKey(that.selectDiv.find("li.active").attr("key"));
			            break;
			        case $.ui.keyCode.UP:
			        	break;
			        case $.ui.keyCode.DOWN:
			        	break;
			        case $.ui.keyCode.LEFT:
			        	break;
			        case $.ui.keyCode.RIGHT:
			        	break;
			        default:
			        	that.setDataArray();
				        break;
				}
			});
			/* 添加选项 */
			that.append(widget.options.items);

			/* 根据输入框中的值，对下拉框赋初始值 */
			this.value(widget.element.val(), false);

			this.width(widget.options.width);
			this.itemWidth(widget.options.itemWidth);
			this.size(widget.options.size);
			this.readonly(widget.options.readonly);

			/* 绑定事件 */
			this.selectDiv.click(function() {
				if (widget.options.readonly) {
					return true;
				}
				that.setDataArray();
			}).mouseleave(function() {
				that.close();
			}).delegate("li", "click", function() {
				that.setByKey($(this).attr("key"));
				that.close();
				return false;
			});
			return this;
		};
		
		this.readonly = function(readonly) {
			if (readonly) {
				this.selectDiv.addClass("nui-readonly");
				this.input.addClass("cna");
				this.input.prop("disabled",true);
			} else {
				this.selectDiv.removeClass("nui-readonly");
				this.input.removeClass("cna");
				this.input.prop("disabled",false);
			}
		};
		
		this.setDataArray = function(){
			this.close();
			this.itemMap = {};
			this.selectDiv.find("ul.nui-select-list").empty();
			var items = [];
			if(widget.options.items && widget.options.items.length>0){
				$(widget.options.items).each(function(i, item) {
					var val = that.input.val();
					var txt = item.text.toLowerCase();
					if(txt.indexOf(val.toLowerCase()) != -1){
						items.push(item);
					}
				});
				that.append(items);
			}
	        that.open();
		};
		
		this.value = function(value, trigger) {
			this.dropDownCon.hide();
			if (value == _undefined) {
				return widget.element.val();
			} else {
				var find = false;
				var key;
				this.selectDiv.find("li").each(function(i) {
					key = $(this).attr("key");
					var item = that.itemMap[key];
					if (item.value == $.trim(value)) {
						find = true;
						return false;
					}
				});
				if (!find) {
					key = this.input.val();
				}
				this.setByKey(key);

				if (trigger && this.originalKey != key) {
					widget._trigger("change", null, {
						item : this.itemMap[key],
						originalItem : this.itemMap[this.originalKey]
					});
					this.originalKey = key;
				}
			}
		};
		
		this.setByKey = function(key) {
			var item = this.itemMap[key];
			if (item) {
				widget.element.val(item.value);
				this.input.val(this.selectDiv.find("li[key=" + key + "]").html());
			} else {
				widget.element.val("");
				this.input.val(key);
			}
			this.select(key);
		};
		
		this.select = function(key) {
			this.selectDiv.find("li.active").removeClass("active");
			this.selectDiv.find("li[key=" + key + "]").addClass("active");
			this.scrollTop();

			if (this.selectDiv.find("li.active").size() == 1) {
				widget._trigger("select", null, {
					item : this.itemMap[key]
				});
			}
		};
		
		this.scrollTop = function() {
			/* 计算滚动条的位置 */
			var li = this.selectDiv.find("li.active");
			if (widget.options.size && this.selectDiv.find("li").size() > widget.options.size) {
				this.dropDownCon.scrollTop(
						this.selectDiv.find("li").index(li) * 22 + 11 + 5 - this.dropDownCon.height() / 2);
			}
		};

		this.open = function() {
			if (!this.isOpen) {
				this.selectDiv.addClass("zindex-up");
				this.dropDownCon.show();
				this.scrollTop();
				$(document.body).bind("keyup.nrichselect", function(event) {
					var li;
					switch (event.keyCode) {
					case $.ui.keyCode.UP:
						li = that.selectDiv.find("li.active").prev();
						if (li.size() == 0) {
							li = that.selectDiv.find("li:last");
						}
						that.setByKey(li.attr("key"));
						break;
					case $.ui.keyCode.DOWN:
						li = that.selectDiv.find("li.active").next();
						if (li.size() == 0) {
							li = that.selectDiv.find("li:first");
						}
						that.setByKey(li.attr("key"));
						break;
					case $.ui.keyCode.ENTER:
						that.close();
						break;
					}
				});

				this.originalKey = this.selectDiv.find("li.active").attr("key");
				if(this.selectDiv.find("li.active").size() == 0 && that.input.val()!=""){
					this.select(this.selectDiv.find("li:first").attr("key"));
				}
				this.isOpen = true;
			}
		};
		
		this.close = function() {
			if (this.isOpen) {
				this.selectDiv.removeClass("zindex-up");
				this.dropDownCon.hide();
				$(document.body).unbind("keyup.nrichselect");

				var key = this.selectDiv.find("li.active").attr("key");
				if (key != this.originalKey) {
					widget._trigger("change", null, {
						item : this.itemMap[key],
						originalItem : this.itemMap[this.originalKey]
					});
					this.originalKey = key;
				}
				this.isOpen = false;
			}
		};
		
		this.size = function(size) {
			if (size && this.selectDiv.find("li").size() > size) {
				this.dropDownCon.css("height", 22 * size + 10);
			} else {
				this.dropDownCon.css("height", "auto");
			}
		};
		this.width = function(width) {
			if (width) {
				this.selectDiv.width(width);
			}
			this.dropDownCon.css("min-width", this.selectDiv.outerWidth() - 2);
		};
		this.itemWidth = function(width) {
			if (width) {
				this.dropDownCon.width(width - 2);
			} else {
				this.dropDownCon.width("auto");
			}
		};
		this.append = function(items){
			var html = "";
			for(var i in items){
				var item = 	items[i];
				var key = nextSeq();
				/* 将下拉框选项加入到map中，方便后续的使用 */
				this.itemMap[key] = item;
				html+="<li class=\"nui-select-list-li\" key='" + key + "'>"+ item.text +"</li>";
			}
				this.selectDiv.find("ul.nui-select-list").append(html);
				this.size(widget.options.size);
		};
		
		this.add = function(item, index) {
			var key = nextSeq();

			/* 将下拉框选项加入到map中，方便后续的使用 */
			this.itemMap[key] = item;

			var wrap = $("<li class=\"nui-select-list-li\"  key='" + key + "'></li>");
			var li = this.selectDiv.find("li:eq(" + index + ")");
			if (li.size() == 1) {
				li.after(wrap);
			} else {
				this.selectDiv.find("ul.nui-select-list").append(wrap);
			}
			this.size(widget.options.size);
			widget._trigger("render", null, {
				wrap : wrap,
				item : item
			});
		};
		/* index:undefined 删除全部；数字 删除从0开始计数的项；否则按照value删除 */
		this.remove = function(index) {
			if (index == 0 || index) {
				var li;
				if (typeof index == "number") {
					li = this.selectDiv.find("li:eq(" + index + ")");
				} else {
					/* 按照value查找 */
					for ( var key in this.itemMap) {
						if (this.itemMap[key].value == index) {
							li = this.selectDiv.find("li[key=" + key + "]");
							break;
						}
					}
				}
				if (li && li.size() == 1) {
					/* 删除li，及map中的值 */
					if (li.is(".active")) {
						/* 删除的正好是当前行则需要清空值 */
						this.setByKey("");
						/* 触发chang事件 */
						widget._trigger("change", null, {
							item : _undefined,
							originalItem : this.itemMap[this.originalKey]
						});
						this.originalKey = "";
					}
					delete this.itemMap[li.attr("key")];
					li.remove();
				}
			} else {
				this.itemMap = {};
				this.selectDiv.find("ul.nui-select-list").empty();
				/* 重新赋值 */
				this.value("", true);
			}
			this.size(widget.options.size);
		};

		this.destory = function() {
			/* 将输入框移出到div */
			this.selectDiv.after(widget.element);
			this.selectDiv.parent().removeClass("nui-select");
			this.selectDiv.remove();
			widget.element.show();
		};
	}

	$.widget("f.nrichselect", {
		options : {
			_core : null,
			readonly : false,
			width : null,
			itemWidth : null,
			size : null,
			items : [],
			render : function(event, ui) {
				ui.wrap.html(ui.item.text);
			}
		},
		_create : function() {
			var that = this;
			var options = that.options;
			options._core = new Core(that).init();
		},
		_destroy : function() {
			this.options._core.destory();
			this.options._core = null;
		},
		_setOptions : function(options) {
			var that = this;
			$.each(options, function(key, value) {
				that._setOption(key, value);
			});
		},
		_setOption : function(key, value) {
			this._super(key, value);
			switch (key) {
			case "size":
				this.options._core.size(value);
				break;
			case "readonly":
				this.options._core.readonly(value);
				break;
			}
		},
		changeItems: function(items) { 
			this.options.items=items;
			this.options._core.append(items);
		},
		remove : function(index) {
			this.options._core.remove(index);
		},
		value : function(val) {
			this.options._core.value(val, true);
		},
		setEmptyVal : function(){
			this.options._core.setByKey("");
		},
		add : function(item, index) {
			this.options._core.add(item, index);
		},
		readonly : function(readonly) {
			this.options.readonly=readonly;
			this.options._core.readonly(readonly);
		},
		clear : function() {
			this.options._core.remove();
		},
		wrap : function() {
			return this.options._core.selectDiv;
		},
		destory :  function() {
			 this.options._core.destory();
			 return this.options._core = null;
		}
	});

})(jQuery);