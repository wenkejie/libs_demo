/**
 * @version 1.0.0
 * @author 史磊 2013-05-03
 * @depends jquery-1.9.1.js jquery.ui.core.js jquery.ui.widget.js
 *          jquery.ui.mouse.js jquery.ui.draggable.js jquery.ui.resizable.js
 *          jquery.ui.position.js
 * @description 弹出窗口
 * 
 * @option height 窗口内容的高度，未设置则自适应内容
 * @option width 窗口内容的宽度，未设置则自适应内容
 * @option draggable = true 是否支持拖拉
 * @option resizeable = false 是否支持改变大小，窗口可以放大，缩小，但不能比第一次打开时小（为了保证窗口的内容正常显示）。
 * @option maxable = false 是否支持最大化
 * @option title = '' 窗口标题
 * @option url 用iframe方式打开，优先级别高于content
 * @option content
 *         可以是string，jquery对象但是jquery对象只能是新创建，不能使用当前页面对象，ie6下不能用jquery对象。
 * @option animate=true 动画
 * @option animateDuration = 200 动画持续时间
 * 
 * @event load = function(event,ui){...} 在页面打开后执行的事件，只在内容为html才有效。
 * @event beforeUnload = function(event,ui){...} 在窗口关闭前执行，return false 可以阻止窗口关闭。
 * @event resizeStart = function(event,ui){...}
 * @event resizeStop = function(event,ui){...}
 * 
 * @method drag(position); 将窗口移到指定坐标 {left,top}
 * @method resize(size); 改变窗口大小，不受最小尺寸的限制。并且重置最小尺寸。然后自动将窗口居中。{width,height}
 * @method parent() ; 得到父窗口对象。
 * 
 */
;
(function($, _undefined) {

	var fw = window.fwindow = {};

	if (window == top) {
		/* 只在顶级页面提供窗口功能 */

		var sequence = 1000;/* id 的序列号 */
		var overLay = null;
		var stack = [];/* 维护窗口的堆栈 */

		/* 顶级窗口特有功能 */
		function Core(widget) {
			var that = this;
			/* 增长2 是为了方便的维护自身的zindex 和 遮罩的zindex */
			this.id = sequence = sequence + 2;
			this.name = "win_" + this.id;
			this.cntWrap = null;// 内容部分的包裹。url 该包裹为iframe，content 该包裹为 div
			this.titleHeight = 30;
			this.minMargin = 4;// 窗口与浏览器的最小边距
			this.scroll = null;/*自定义的模拟滚动条，生命周期与窗口相同*/

			/* 加入堆栈 */
			stack.unshift(this);

			this.init = function() {
				/* 初始化遮罩的html结构 */
				if (overLay == null) {
					overLay = $("<div class='fui-overlay-opa-0'></div>");
					$("body").append(overLay);
					
					//alert(1);
					/*overLay.css( {
						height : $(document).height() - 1,
						width : $(document).width()
					});*/

					if (widget.options.animate) {
						overLay.fadeTo(widget.options.animateDuration, 0.4)
					} else {
						overLay.css("opacity", 0.4);
					}
				}
				overLay.css("z-index", this.id - 1);

				/* 初始化窗口的html结构 */
				widget.element
						.addClass("fui-dialog dialog-confirm")
						.css("z-index", this.id)
						.append(
								"<div class='fui-dialog-title'><h4 class='tal'></h4><a href='javascript:' class='fui-dialog-top-btn maximize' title='最大化'></a><a href='javascript:' class='fui-dialog-top-btn close' title='关闭'></a></div>");
				if (widget.options.url) {
					this.cntWrap = $("<iframe name='" + this.name + "' frameborder='0' />");
				} else {
					this.cntWrap = $("<div></div>");
				}
				this.cntWrap.appendTo(widget.element);
				widget.element.appendTo($("body"));
				
				this.myScroll();// 必须在窗口添加到body后处理滚动条的逻辑，因为这个div是包裹在窗口外的。

				/* 移动 */
				widget.element.draggable( {
					handle : "div.fui-dialog-title",
					containment : overLay,
					start : function() {
						/* 由于iframe对于鼠标移动会产生干扰，因此先隐藏，结束后再显示 */
						widget.element.find("iframe").css("visibility", "hidden");
					},
					stop : function() {
						that.fixPosition();
						widget.element.find("iframe").css("visibility", "visible");
					}
				});

				/* 拖动大小 */
				widget.element.resizable( {
					containment : overLay,
					start : function(event) {
						/* 由于iframe对于鼠标移动会产生干扰，因此先隐藏，结束后再显示 */
						widget.element.find("iframe").hide();

						that.resizeStart(event);
					},
					stop : function(event) {
						/* 拖拉开始时隐藏的iframe需要显示 */
						widget.element.find("iframe").show();

						that.resizeStop(event);
					}
				});

				/* 绑定窗口事件 */
				widget.element.find("a.close").click(function() {
					widget.close();
				});
				widget.element.find("a.maximize").click(function(event) {
					that.resizeStart(event);
					if ($(this).is("a.restore")) {
						/* 还原前先减小内容的尺寸，保证外框不受里面撑大的影响 */
						that.cntWrap.css( {
							height : that.original.height - that.titleHeight,
							width : that.original.width
						});
						/* 还原窗口 */
						if (widget.options.animate) {
							widget.element.animate(that.original, widget.options.animateDuration, function() {
								that.resizeStop(event);
							});
						} else {
							widget.element.css(that.original);
						}

						/* 根据参数启用drag和resize */
						that.draggable(widget.options.draggable);
						that.resizeable(widget.options.resizeable);
						/* 改变按钮的图标 */
						$(this).removeClass("restore");
						$(this).attr("title", "最大化");
					} else {
						/* 记录当前窗口的位置，提供还原用 */
						that.original = $.extend( {
							height : widget.element.height(),
							width : widget.element.width()
						}, widget.element.position());

						var css = {
							height : $(window).height() - 2 - 2 * that.minMargin,/*-2 是扣除两侧边框的宽度*/
							width : $(window).width() - 2 - 2 * that.minMargin,
							top : /*$(window).scrollTop() + */that.minMargin,
							left :/* $(window).scrollLeft() + */that.minMargin
						};
						
						/* 当窗口高度大于可视区域时，放大窗口前先减小内容的尺寸，保证外框不受里面撑大的影响 */
						if(that.original.height > css.height){
							that.cntWrap.css( {
								height : 10,
								width : 10
							});	
						}
						
						
						/* 放大窗口 */
						if (widget.options.animate) {
							widget.element.animate(css, widget.options.animateDuration, function() {
								that.resizeStop(event);
							});
						} else {
							widget.element.css(css);
						}

						/* 禁止drag和resize */
						that.draggable(false);
						that.resizeable(false);
						/* 改变按钮的图标 */
						$(this).addClass("restore");
						$(this).attr("title", "还原");
					}
					if (!widget.options.animate) {
						that.resizeStop(event);
					}
					// 点击后将光标移走
						$(this).blur();
					});

				/* 参数变化 */
				this.title(widget.options.title);
				this.draggable(widget.options.draggable);
				this.resizeable(widget.options.resizeable);
				this.maxable(widget.options.maxable);
				this.url(widget.options.url);
				this.content(widget.options.content);
				this.height(widget.options.height);
				this.width(widget.options.width);

				/* 动画支持 */
				/*
				 * 从小变大
				 * 
				 * if (widget.options.animate) { var css = $.extend( { height :
				 * widget.element.height(), width : widget.element.width() },
				 * widget.element.position()); 从最小开始动画变大
				 * this.cntWrap.css("visibility","hidden"); widget.element.css( {
				 * height : 0, width : 0, top : $(window).scrollTop() +
				 * $(window).height() / 2, left : $(window).scrollLeft() +
				 * $(window).width() / 2 }); widget.element.animate(css,
				 * widget.options.animateDuration, function() {
				 * that.cntWrap.css("visibility","visible"); }); }
				 */

				/* 从上向下 */
				if (widget.options.animate) {
					var css = {
						top : widget.element.position().top,
						opacity : 1
					};
					widget.element.css( {
						top : css.top - 50,
						opacity : 0
					}).animate(css, widget.options.animateDuration);
				}
				return this;
			};

			/* 在窗口移动后修正top，left 的坐标 */
			this.fixPosition = function() {
				if (parseInt(widget.element.css("top")) < 0) {
					widget.element.css("top", that.minMargin);
				}
				if (parseInt(widget.element.css("left")) < 0) {
					widget.element.css("left", that.minMargin);
				}
			};
			this.resizeStart = function(event) {
				/* 记录移动前的大小 */
				that.originalSize = {
					width : that.cntWrap.width(),
					height : that.cntWrap.height()
				};
				widget._trigger("resizeStart", event, {
					size : that.originalSize,
					self : that.self()
				});
			};

			this.resizeStop = function(event) {
				var size = {
					height : widget.element.innerHeight() - that.titleHeight,
					width : widget.element.innerWidth()
				};
				that.cntWrap.css(size);

				/* 修改控件中的高，宽 */
				widget.options.height = size.height;
				widget.options.width = size.width;

				widget._trigger("resizeStop", event, {
					originalSize : that.originalSize,
					size : size,
					self : that.self()
				});
			};

			this.self = function() {
				if (this.cntWrap.is("iframe")) {
					return top[this.name].window;
				}
			};

			this.height = function(height) {
				height = parseInt(height);
				if (height) {
					/* 保证窗口不会大于浏览器可视区域 */
					//height = Math.min($(window).height() - this.titleHeight - 2 - 2 * that.minMargin, height);
					widget.options.height = height;

					this.cntWrap.height(height);
					widget.element.height(height + this.titleHeight);
				} else {
					widget.options.height = this.cntWrap.height();
				}
				/* 重新计算纵向位置居中 */
				widget.element.css("top", Math.max(this.minMargin,/*$(window).scrollTop() + */ ($(window).height() - widget.element.outerHeight()) / 2));

				/* 重置窗口的最小高度 */
				widget.element.resizable("option", "minHeight", widget.element.height());
			};
			this.width = function(width) {
				if (width) {
					/* 保证窗口不会大于浏览器可视区域 */
					width = Math.min($(window).width() - 2 - 2 * that.minMargin, width);
					widget.options.width = width;

					this.cntWrap.width(width);
					widget.element.width(width);
				} else {
					widget.options.width = this.cntWrap.width();
					widget._trigger("_width", null, {
						width : width
					});
				}

				/* 重新计算横向位置居中 */
				widget.element.css("left",/*$(window).scrollLeft() + */($(window).width() - widget.element.outerWidth()) / 2);
				/* 重置窗口的最小宽度 */
				widget.element.resizable("option", "minWidth", widget.element.width());
			};
			this.draggable = function(able) {
				if (able) {
					widget.element.find("div.fui-dialog-title").addClass("cur-m");
					widget.element.draggable("enable");
				} else {
					widget.element.find("div.fui-dialog-title").removeClass("cur-m");
					widget.element.draggable("disable");
				}
			};
			this.resizeable = function(able) {
				if (able) {
					widget.element.resizable("enable");
				} else {
					widget.element.resizable("disable");
				}
			};
			this.maxable = function(able) {
				if (able) {
					widget.element.find("a.maximize").show();
				} else {
					widget.element.find("a.maximize").hide();
				}
			};
			this.title = function(title) {
				widget.element.find("div.fui-dialog-title h4").html(title);
			};
			this.url = function(url) {
				if (this.cntWrap.is("iframe")) {
					this.cntWrap.attr("src", url);
				}
			};
			this.content = function(content) {
				if (this.cntWrap.is("div")) {
					this.cntWrap.html(content);
					widget._trigger("load", null, {});
				}
			};

			this.destory = function() {
				/* 先remove iframe ，防止焦点随窗口remove */
				this.cntWrap.remove();

				/* 从堆栈中移除第一个窗口 */
				stack.shift();

				/* 根据堆栈中第一个窗口的zindex设置overLay的样式，如果堆栈为空则删除overLay */
				if (stack.length > 0) {
					overLay.css("z-index", stack[0].id - 1);
				} else {
					if (widget.options.animate) {
						overLay.fadeOut(widget.options.animateDuration, function() {
							overLay.remove();
							overLay = null;
						});
					} else {
						overLay.remove();
						overLay = null;
					}
				}
				
				this.destoryMyScroll();
			};
			
			//2014-5-17 史磊：窗口打开时隐藏滚动条，并且在窗口外包裹一个和可视区域一样大的div，模拟滚动条。
			this.myScroll = function() {
			 
				this.scroll = $("<div style='width:100%;overflow:auto;position:absolute;left:0;top:0;'></div>");
				$("body").append(this.scroll);
			 
				this.scroll.css( {
					"z-index" : this.id - 1,
					top : $(document).scrollTop(),
					height: $(window).height()
				});
				
				if ($(document).height() > document.documentElement.clientHeight){
					 $("html,body").addClass("ofh");
				}
				this.scroll.append(widget.element);
			};
			this.destoryMyScroll = function() {
			//	this.scroll.remove();
				widget.element.unwrap();
				if (stack.length == 0) {
					$("html,body").removeClass("ofh");
				}
			};
			//2014-5-17 史磊：end
		}

		$.widget("f.fwindow", {
			options : {
				_core : null,
				draggable : true,
				resizeable : false,
				maxable : false,
				title : "",
				animate : true,
				animateDuration : 200
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
				case "draggable":
					this.options._core.draggable(value);
					break;
				case "resizeable":
					this.options._core.resizeable(value);
					break;
				case "maxable":
					this.options._core.maxable(value);
					break;
				case "title":
					this.options._core.title(value);
					break;
				case "url":
					this.options._core.url(value);
					break;
				case "content":
					this.options._core.content(value);
					break;
				case "height":
					this.options._core.height(value);
					break;
				case "width":
					this.options._core.width(value);
					break;
				}
			},
			parent : function() {
				return this.options.parent;
			},
			close : function() {
				var that = this;
				var c = this._trigger("beforeUnload", null, {
					self : that.options._core.self()
				});
				if (c) {
					if (that.options.animate) {
						that.element.animate( {
							/*
							 * 从大变小
							 * 
							 * height : 0, width : 0, top : $(window).height() /
							 * 2, left : $(window).width() / 2
							 */
							/* 从下向上 */
							top : that.element.position().top - 50,
							opacity : 0
						}, that.options.animateDuration, function() {
							that.element.remove();
						});
					} else {
						that.element.remove();
					}
				}
			},
			drag : function(position) {
				this.element.css( {
					top : position.top,
					left : position.left
				});
			}
		});
	}

	/* 所有窗口通用功能 */
	fw.create = function(options) {
		var w = $("<div style='top:0;left:0;'></div>");
		return w.fwindow($.extend( {
			parent : self
		}, options));
	};

	fw.widget = function() {
		return $("iframe[name=" + self.name + "]").closest("div.fui-dialog");
	};

	fw.destory = function() {
		this.widget().fwindow('close');
	};

	fw.parent = function() {
		return this.widget().fwindow("parent");
	};

	fw.drag = function(position) {
		this.widget().fwindow("drag", position);
	};

	fw.resize = function(size) {
		this.widget().fwindow("option", size);
	};

})(top.jQuery);