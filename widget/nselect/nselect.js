/**
 * @version 1.0.0
 * @author 史磊 2013-05-14
 * @depends jquery-1.9.1.js jquery.ui.core.js jquery.ui.widget.js
 * @description 下拉框，模拟原生态的select
 * 
 * @option readonly = false
 * @option width 控件总宽
 * @option itemWidth 下拉框的宽度，undefined则自适应内容的宽度，但不小于控件宽
 * @option size 下拉选项的显示行数，超出自动显示滚动条 undefined则自适应内容的高度
 * @option items 选项[{text:'',value:''}] 不支持动态修改
 * 
 * @event change = function(event,ui){...} 值发生变化后触发。上下键不触发。鼠标hover不触发。
 * @event select = function(event,ui){...} 选择后触发。上下键触发。鼠标hover不触发。
 * @event render = function(event,ui){...} 创建选项时触发。目前render的内容只支持静态内容，绑定事件会有冲突。
 * 
 * @method value(val); val 为 undefined 时表示得到当前值。
 * @method add(item,index);index 为 undefined 时添加在最后
 * @method remove(index); 删除行 index 为数字从0计数，否则按值删除
 * @method clear(); 删除所有的项
 * @method wrap(); 得到整个控件最外围的包裹对象
 * 
 */
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
		this.isOpen = false;
		this.originalKey;/* 记录当前值，用于change的触发判断用。 */

		this.init = function() {
			this.selectDiv = $(
					"<div class='nui-form-cell nui-select'><div class='nui-form-cell-cnt'><div class='nui-input'></div><i class='nui-form-cell-icon fs12'>&#13783;</i><div class='nui-drop-down none'><ul class='nui-select-list'></ul></div></div></div>")
					.insertAfter(widget.element.hide());
			/* 将输入框加入到div中 */
			this.selectDiv.append(widget.element);

			/* 添加选项 */
			$(widget.options.items).each(function(i, item) {
				that.add(item);
			});

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
				that.open();
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
			} else {
				this.selectDiv.removeClass("nui-readonly");
			}
		};

		this.value = function(value, trigger) {
			if (value == _undefined) {
				return widget.element.val();
			} else {
				var find = false;
				var key;
				this.selectDiv.find("li").each(function(i) {
					key = $(this).attr("key");
					var item = that.itemMap[key];
					if (item.value == value) {
						find = true;
						return false;
					}
				});
				if (!find) {
					key = "";
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
				this.selectDiv.find("div.nui-input").html(this.selectDiv.find("li[key=" + key + "]").html());
			} else {
				widget.element.val("");
				this.selectDiv.find("div.nui-input").html("");
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
				this.selectDiv.find("div.nui-drop-down").scrollTop(
						this.selectDiv.find("li").index(li) * 22 + 11 + 5 - this.selectDiv.find("div.nui-drop-down").height() / 2);

				this.selectDiv.find("div.nui-drop-down li").css("padding-right", "32px");
			}
		};
		this.open = function() {
			if (!this.isOpen) {
				this.selectDiv.addClass("zindex-up");
				this.selectDiv.find("div.nui-drop-down").show();
				this.scrollTop();
				$(document.body).bind("keyup.nselect", function(event) {
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
				this.isOpen = true;
			}
		};
		this.close = function() {
			if (this.isOpen) {
				this.selectDiv.removeClass("zindex-up");
				this.selectDiv.find("div.nui-drop-down").hide();
				$(document.body).unbind("keyup.nselect");

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
				this.selectDiv.find("div.nui-drop-down").css("height", 22 * size + 10);
			} else {
				this.selectDiv.find("div.nui-drop-down").css("height", "auto");
			}
		};
		this.width = function(width) {
			if (width) {
				this.selectDiv.width(width);
			}
		};
		this.itemWidth = function(width) {
			if (width) {
				this.selectDiv.find("div.nui-drop-down").width(width - 2);
			} else {
				this.selectDiv.find("div.nui-drop-down").width("auto");
			}
		};

		this.add = function(item, index) {
			var key = nextSeq();
			
			/* 将下拉框选项加入到map中，方便后续的使用 */
			this.itemMap[key] = item;
			//对下拉数据中的选项设置为不显示 by胡伟军
			if(item.isdisplay==null){
				item.isdisplay=true;
			}
			var displayStyle = "display: black";
			if(!item.isdisplay){
				displayStyle = "display: none";
			}
			var wrap = $("<li class=\"nui-select-list-li\" style='"+displayStyle+"' key='" + key + "'></li>");
			
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

			this.selectDiv.remove();
			widget.element.show()
		};
	}

	$.widget("f.nselect", {
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
			case "width":
				this.options._core.width(value);
				break;
			case "itemWidth":
				this.options._core.itemWidth(value);
				break;
			case "size":
				this.options._core.size(value);
				break;
			case "readonly":
				this.options._core.readonly(value);
				break;
			}
		},
		remove : function(index) {
			this.options._core.remove(index);
		},
		value : function(val) {
			this.options._core.value(val, true);
		},
		add : function(item, index) {
			this.options._core.add(item, index);
		},
		clear : function() {
			this.options._core.remove();
		},
		wrap : function() {
			return this.options._core.selectDiv();
		}
	});

})(jQuery);