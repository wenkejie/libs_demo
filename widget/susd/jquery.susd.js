function externalCall(fnName) {
	if ($.isFunction($.external[fnName])) {
		$.external[fnName].call(this, arguments);
	}
}
(function($, _undefined) {
	$.extend( {
		external : {
			beforeCloseWin : function() {
				$.external.closeWin();
			},
			openWin : function(options) {
				options = $.extend( {
					width : 900,
					height : 650,
					url : "#",
					modal : 0
				}, options);

				window.location.href = "execute:PoPupForm," + options.width + "," + options.height + "," + options.url + "," + options.modal;
			},
			openPrintWin : function(options) {
				options = $.extend( {
					width : 900,
					height : 650,
					url : "#",
					modal : 0,
					toolBar : 1
				}, options);

				window.location.href = "execute:OpenPrintForm," + options.width + "," + options.height + "," + options.url + "," + options.modal + ","
						+ options.toolBar;
			},
			closeWin : function(options) {
				options = $.extend( {
					refresh : false,
					close : 1
				}, options);
				if (options.close) {
					if (options.refresh) {
						window.location.href = "execute:CloseFormAndRefreshParent";
					} else {
						window.location.href = "execute:CloseForm,1";
					}
				} else {
					if (options.refresh) {
						$.external.refreshParent();
					} else {
						window.location.href = "execute:CloseForm,0";
					}
				}
			},
			refreshParent : function() {
				window.location.href = "execute:RefreshParent";
			},
			refresh : function() {

			}
		}
	});

	window.susd = new function() {
		var sequence = 10;
		this.nextSequence = function() {
			return ++sequence;
		};
		this.getSequence = function() {
			return sequence;
		};

		/**
		 * 缓存机制
		 */
		var cached = {};
		this.isCached = function(key) {
			return key in cached;
		};
		this.getCache = function(key) {
			return cached[key];
		};
		this.putCache = function(key, value) {
			cached[key] = value;
		};
		this.removeCache = function(key) {
			delete cached[key];
		};

		/**
		 * 蒙板
		 */
		var overlayWin = null;
		var overlayProgressbar;
		var overlayProgress;
		var overlayInterval;
		this.overlay = function(close, opt) {
			function showOverlay() {
				overlayWin.dialog("open");
				overlayInterval = setInterval(function() {
					overlayProgress += 3;
					if (overlayProgress > 100) {
						clearInterval(overlayInterval);
					} else {
						overlayProgressbar.progressbar("option", "value", overlayProgress);
					}
				}, 60);
			}

			var options = $.extend( {
				delay : 1000
			}, opt);

			overlayProgress = 0;
			if (close) {
				overlayWin.dialog("close");
				clearInterval(overlayInterval);
				return;
			}
			if (overlayWin == null) {
				overlayWin = $("<div></div>").dialog( {
					width : '50%',
					height : 0,
					autoOpen : false,
					modal : true,
					resizable : false,
					draggable : false,
					open : function() {
						overlayWin.hide();
					}
				});
				overlayProgressbar = overlayWin.prev().empty().removeClass().progressbar();
			}
			overlayProgressbar.progressbar("option", "value", overlayProgress);

			/* 在速度快的情况下，不显示进度条 */
			if (options.delay) {
				setTimeout(showOverlay, options.delay);
			} else {
				showOverlay();
			}
		};
		/*
		 * 各种屏蔽更能，目前支持 鼠标右键，F5，Backspace
		 */
		this.shield = function(opt) {
			opt = $.extend( {
				mouseright : true,
				f5 : false,
				backspace : false
			}, opt);
			if (opt.mouseright) {
				document.oncontextmenu = function(e) {
					return false;
				}
			}
			if (opt.f5) {
				$(document).bind("keydown.shieldF5", function(event) {
					event = event || window.event;
					/* F5, ctrl + r */
					if (event.keyCode == 116 || event.ctrlKey && event.keyCode == 82) {
						event.keyCode = 0;
						event.cancelBubble = false;
						event.returnValue = false;
						return false;
					}
				});
			}
			if (opt.backspace) {
				$(document).bind("keydown.shieldBackspace", function(event) {
					event = event || window.event;
					if (event.keyCode == 8) {
						var ele = $(event.srcElement || event.target);
						if (ele.is("input:enabled:not([readonly])") || ele.is("textarea:enabled:not([readonly])")) {
							return true;
						}
						event.keyCode = 0;
						event.cancelBubble = false;
						event.returnValue = false;
						return false;
					}
				});
			}
		};
	};

	/**
	 * timer 计时器，用户客户端性能分析
	 */
	window.timer = new function() {
		var t;
		var dialog = null;
		this.begin = function() {
			t = [ [ new Date(), "" ] ];
		};
		this.append = function(desc) {
			t.push( [ new Date(), desc ]);
		};
		this.end = function(con) {
			var msg = "";
			var fz = (t[t.length - 1][0] - t[0][0]) / 100;
			fz = -1;
			for ( var i = 1; i < t.length; i++) {
				if ((t[i][0] - t[i - 1][0]) > fz) {
					msg += (t[i][0] - t[i - 1][0]) + "/" + ((t[i][0] - t[0][0])) + ":" + t[i][1] + "\n";
				}
			}
			if (dialog == null) {
				dialog = $("<div></div>").dialog( {
					position : [ 10, 10 ],
					height : 200,
					buttons : {
						clear : function() {
							dialog.html("");
						}
					}
				});
			}
			dialog.prepend(msg.replace(/\n/g, "<br/>") + "<hr/>").show();
		};
	};

	$.fn.extend( {
		/**
		 * 鼠标右键
		 * 
		 * data格式：
		 * [[{text:'',func:function(){console.log(this)},disabled:true,data:[]},{}],[]]
		 */
		susdRightMenu : function(data, options) {
			var self = $(this);
			self.smartMenu(data, options);
			return self;
		},
		/**
		 * 初始化table 鼠标移过tr时的效果，列排序
		 */
		susdInitTable : function(sortable) {
			var self = $(this);
			/* 排序列 */
			if (sortable) {
				self.find("thead>tr>th[sortcolumn=" + self.next().val() + "]").addClass(self.next().next().val() == "asc" ? "sortup" : "sortdown");

				self.find("thead > tr > th[sortcolumn]").css( {
					"cursor" : "pointer"
				}).append("<s class='sortIcon'></s>").hover(function() {
					$(this).addClass("hover");
				}, function() {
					$(this).removeClass("hover");
				}).click(function() {
					var th = $(this);
					var sort;
					if (th.is(".sortup")) {
						th.removeClass("sortup");
						th.addClass("sortdown");
						sort = "desc";
					} else if (th.is(".sortdown")) {
						th.removeClass("sortdown");
						th.addClass("sortup");
						sort = "asc";
					} else {
						th.siblings("[sortcolumn]").removeClass("sortup").removeClass("sortdown");
						th.addClass("sortup");
						sort = "asc";
					}
					self.next().val(th.attr("sortcolumn")).next().val(sort);
					self.parent().next().children("input").val(1);/* 排序后回到第一页 */
					self.parents("form").submit();
				});
			}
			/* 行hover */
			self.find("tbody > tr:not(.ui-table-toggle-content)").hover(function() {
				$(this).addClass("hover");
			}, function() {
				$(this).removeClass("hover");
			});
			/* 翻页的 hover 效果 */
			self.parent().next().find("li:has(a)").hover(function() {
				$(this).addClass("hover");
			}, function() {
				$(this).removeClass("hover");
			});
			return self;
		},
		/**
		 * 翻页
		 */
		susdTurntoPage : function(pageNo) {
			var self = (this);
			var input = self.parents(".tableScroll").next().children("input");
			if (pageNo) {
				input.val(pageNo);
			}
			self.parents("form").submit();
		},
		/**
		 * 下拉框
		 */
		susdAutocomplete : function(source, options) {
			options = $.extend( {
				useCache : true,
				selectOnly : false,/* 必须选择 */
				param : {},
				select : function(event, ui) {
				},
				change : function(event, ui, display) {
				}
			}, options);
			var self = $(this);
			self.each(function() {
				var _key = $(this);
				var _self = _key.next();
				if (_self.attr("readonly")) {
					return;
				}
				var lastXhr;
				_self.autocomplete( {
					'source' : typeof source == "object" ? source : function(request, response) {
						var p = $.isFunction(options.param) ? options.param.call(_key[0]) : options.param;
						var cacheKey = source + $.param(p);

						if (options.useCache && susd.isCached(cacheKey)) {
							var json = susd.getCache(cacheKey);
							if (request.term) {
								try {
									var eg = new RegExp(request.term, "i");
									response($.grep(json, function(n, i) {
										return eg.test(n.value);
									}));
								} catch (e) {
									response($.grep(json, function(n, i) {
										return n.value.indexOf(request.term) > -1;
									}));
								}
							} else {
								response(json);
							}
							return;
						}
						lastXhr = $.getJSON("autocomplete.ctrl", $.extend( {
							"source" : source
						}, p, request), function(json, status, xhr) {
							if (xhr === lastXhr) {
								if (options.useCache) {
									susd.putCache(cacheKey, json);
								}
								response(json);
							}
						});
					},
					/* autoFocus : true, */
					minLength : 0,
					change : function(event, ui) {
						if (ui && ui.item) {

						} else {
							var vObj = $(this).prev();
							if (this.value == "") {
								vObj.susdValidate( {
									validate : function() {
										return false;
									}
								});
							} else if (options.selectOnly) {
								vObj.susdValidate( {
									validate : function() {
										return "请选择 " + options.selectOnly;
									}
								});
							}
							_key.val(this.value);
							vObj.susdValidate("validate");
						}
						options.change.call(_key[0], event, ui, _self);
					},
					select : function(event, ui) {
						var vObj = $(this).prev();
						vObj.susdValidate( {
							validate : function() {
								return false;
							}
						});
						_key.val(ui.item.key);
						vObj.susdValidate("validate");

						options.select(event, ui);
					}
				});
				_self.mousedown(function() {
					_self.autocomplete("search", options.useCache ? "" : _self.val());
				});
				_self.siblings("s").click(function() {
					_self.autocomplete("search", options.useCache ? "" : _self.val());
				});
			});

			return self;
		},
		/**
		 * 
		 */
		susdCombogrid : function(source, options) {
			var self = $(this);

			options = $.extend( {
				url : 'combogrid.ctrl?source=' + source,
				showOn : true,
				debug : false,
				/* width:"450px", */
				autoChoose : true,
				close : function(event, ui) {
					$(this).susdValidate("validate");
				}

			}, options);

			self.each(function() {
				var _self = $(this);
				if (_self.attr("readonly")) {
					return;
				}
				_self.combogrid(options);
			});

			return self;
		},
		/**
		 * form提交
		 */
		susdSubmit : function(fn) {
			var self = $(this);
			if (self.is("form")) {
				var fnArr = self.data("formFnArr");
				if (!fnArr) {
					fnArr = [];
					self.data("formFnArr", fnArr);
					self.submit(function() {
						var fns = self.data("formFnArr");
						for ( var i in fns) {
							if (!fns[i].call(this)) {
								return false;
							}
						}
						return true;
					});
				}
				fnArr.push(fn);
			}
		}
	});

	/**
	 * 使表格的body行具备展开效果
	 */
	$.widget("susd.susdTableToggle", {
		_clicktimeout : null,
		options : {
			delay : 300,
			load : function(panel) {
			},
			open : function(panel) {
			},
			close : function(panel) {
			},
			dblclick : null
		},
		_create : function() {
			var self = this;

			self.element.find("tbody > tr:not(.ui-table-toggle-content)").bind("click.susdTableToggle", function(e) {
				if (e.target.tagName != "TD") {
					return;
				}
				var _this = this;
				if ($.isFunction(self.options.dblclick)) {
					clearTimeout(self._clicktimeout);
					self._clicktimeout = setTimeout(function() {
						self.toggle(_this);
					}, self.options.delay);
				} else {
					self.toggle(_this);
				}

			}).bind("dblclick.susdTableToggle", function() {
				clearTimeout(self._clicktimeout);
				if ($.isFunction(self.options.dblclick)) {
					self.options.dblclick.call(this);
				}
			});

			return self;
		},
		toggle : function(tr) {
			var self = this;
			var $tr = $(tr);
			var next = $tr.next();
			if (next.is(".ui-table-toggle-content")) {
				var panel = next.children("td");
				if (next.is(":visible")) {
					self.close(tr);
				} else {
					self.open(tr);
				}
			} else {
				next = $("<tr class='ui-table-toggle-content'><td colspan='" + $tr.children("td").size() + "'></td></tr>");
				$tr.after(next);
				if ($.isFunction(self.options.load)) {
					self.options.load.call(tr, next.children("td"));
				}
				self.open(tr);
			}
			return self;
		},
		open : function(tr) {
			var self = this;
			var $tr = $(tr);
			var next = $tr.next();
			/* 关闭其他，保证始终只有一个打开的状态 */
			$tr.siblings(".ui-table-toggle-content:visible").each(function() {
				self.close($(this).prev());
			});
			next.show();
			$tr.addClass("active");
			if ($.isFunction(self.options.open)) {
				self.options.open.call(tr, next.children("td"));
			}
			return self;
		},
		close : function(tr) {
			var self = this;
			var $tr = $(tr);
			var next = $tr.next();
			next.hide();
			$tr.removeClass("active");
			if ($.isFunction(self.options.close)) {
				self.options.close.call(tr, next.children("td"));
			}
			return self;
		}
	});

	/**
	 * 
	 */
	$.widget("susd.susdTip", {
		_isOpen : false,
		_tip : null,
		_panel : null,
		options : {
			hover : false,
			create : $.noop,
			open : $.noop,
			close : $.noop
		},
		_create : function() {
			var self = this, options = self.options;
			self._tip = $("<div class='messageBox'></div>");
			self._panel = $("<div></div>");

			self.element.after(self._tip);
			if (options.hover) {
				self.element.hover(function() {
					self.open();
				}, function() {
					self.close();
				});
			} else {
				var close = $("<a class='closeBtn' href='javascript:$.noop();'></a>");
				close.click(function() {
					self.close();
				});
				self._tip.append(close);
				self.element.click(function() {
					if (self.isOpen()) {
						self.close();
					} else {
						self.open();
					}
					return false;
				});
			}
			self._tip.append(self._panel);
			return self;
		},
		open : function() {
			var self = this;
			self._tip.show();
			self._isOpen = true;
			self._trigger('open');
			/* 计算显示位置 */
			if (self.element.offset().top + self._tip.outerHeight() > $(window).height() + $(document).scrollTop()) {
				self._tip.css("margin-top", self.element.height() + 10 - self._tip.outerHeight());
			} else {
				self._tip.css("margin-top", -4);
			}
			return self;
		},
		close : function() {
			var self = this;
			self._tip.hide();
			self._isOpen = false;
			self._trigger('close');
			return self;
		},
		isOpen : function() {
			return this._isOpen;
		},
		getPanel : function() {
			return this._panel;
		}
	});
	/**
	 * 赋予下拉框可以输入 并 过滤的效果
	 */
	$.widget("susd.susdSelect",
			{
				options : {
					delay : 300,
					selectOnly : true,
					source : null
				},
				_input : null,
				_arrow : null,
				_options : null,
				_emptyText : null,
				_isOpen : false,
				_create : function() {
					var self = this;
					if (self.element.is("[selectonly]")) {
						self.options.selectOnly = self.element.attr("selectonly") == "true";
					}
					self._input = self.element.next();
					self._arrow = self._input.next();
					/* 缓存select 的 option */
					self._options = [];
					self.element.children().each(function() {
						if (!this.value) {
							self._emptyText = this.text;
						}
						self._options.push(this);
					});
					if (!self._emptyText) {
						self._emptyText = "";/*--请选择--*/
						self._options.unshift($("<option value=''>" + self._emptyText + "</option>")[0]);
						self.element.prepend(self._options[0]);
					}
					self._selectOnlyCheck();
					if (self._input.val() == "") {
						self.element.val("");
						self._input.val(self._emptyText);
					} else if ($.trim(self._input.val()) != self.element.children(":selected").text()) {
						self.element.val("");
					}

					self.element.wrap("<div style='position:absolute;display:none;left:0;'></div>");
					self.element.show();

					self.element.bind("click.susdSelect", function(event) {
						self.select(null, event);
					});

					self._input.bind("click.susdSelect", function(event) {
						if (self.isOpen()) {
							self.close(event);
						} else {
							self.search(this.value, event);
						}
					}).bind("keyup.susdSelect", function(event) {
						if (self._input.attr("readonly")) {
							return;
						}
						switch (event.keyCode) {
						case 38:/* 上 */
							var op = self.element.children(":selected").prevAll(":first");
							if (!op.is("option")) {
								op = self.element.children(":last");
							}
							self.select(op, event);
							break;
						case 40: /* 下 */
							var op = self.element.children(":selected").nextAll(":first");
							if (!op.is("option")) {
								op = self.element.children(":first");
							}
							self.select(op, event);
							break;
						case 13:/* 回车 值发生变化表示中文输入，否则表示关闭 */
							if (self.options.term == self._input.val()) {
								self.close(event);
								break;
							}
						default:
							self.search(this.value, event);
						}
					}).bind("focus.susdSelect", function(event) {
						self.focus(event);
					}).bind("keydown.susdSelect", function(event) {
						if (self._input.attr("readonly")) {
							return;
						}
						switch (event.keyCode) {
						case 9:
							self.close(event);
							break;
						default:
							if (this.value == self._emptyText) {
								this.value = "";
							}
						}

					}).bind("blur.susdSelect", function(event) {
						$(document).one("mouseup.susdSelect", function(event) {
							self.close(event);
						});
					});

					self._arrow.bind("click.susdSelect", function() {
						self._input.focus();
						self._input.click();
					});

					return self;
				},
				/* 允许输入的情况下，补充不匹配的项 */
				_selectOnlyCheck : function() {
					var self = this;
					var inputValue = self._input.val();
					if (!self.options.selectOnly && inputValue != "" && inputValue != self._emptyText && inputValue != self.element.children(":eq(1)").text()) {
						$(self.element.children(":eq(0)")).after($("<option>" + inputValue + "</option>").attr("value", inputValue));
					}
				},
				_refreshOptions : function(arr, event, term) {
					var self = this;
					self.options.term = term;
					/* 重新生成options */
					self.element.children().remove();
					$(arr).each(function() {
						self.element.append(this);
					});
					self._selectOnlyCheck();
					/* 默认选中第一个匹配项，如果没有则选中空 */
					if (self._input.val() != self._emptyText && self.element.children().size() > 1) {
						/*
						 * self.element[0].value =
						 * self.element.children("[value!=]:first").val();
						 */
						self.element.val(self.element.children("[value!=]:first").val());
					} else {
						self.element.val("");
					}

					self.element.attr("size", Math.max(2, Math.min(10, self.element.children().size())));
					self._trigger('search', event, term);
					self.open(event);

					return self;
				},
				search : function(term, event) {
					var self = this;
					if (self._input.attr("readonly")) {
						return self;
					}

					if (typeof self.options.source === "string") {
						clearTimeout(self.searching);
						self.searching = setTimeout(function() {
							if (term == self._emptyText) {
								term = "";
							}
							if (self.options.term != term) {
								self.options.term = term;
								if (self.xhr) {
									self.xhr.abort();
								}
								var p = {};
								if ($.isFunction(self.options.param)) {
									p = self.options.param.call(self.element[0], term);
								} else {
									p = self.options.param;
								}
								self.xhr = $.ajax( {
									url : "autocomplete.ctrl?source=" + self.options.source,
									data : $.extend( {}, p, {
										term : term
									}),
									dataType : "json",
									success : function(data) {
										var arr = [ self._options[0] ];
										$(data).each(function() {
											arr.push($("<option value='" + this.key + "'>" + this.value + "</option>")[0]);
										});
										self._refreshOptions(arr, event, term);
										/* 允许输入的情况下，需要重新验证 */
										if (!self.options.selectOnly) {
											self.element.susdValidate("validate");
										}
									},
									error : function() {
										self._refreshOptions( [ self._options[0] ], event, term);
									}
								});
							} else {
								self.open(event);
							}
						}, self.options.delay);
					} else {
						var arr;
						if (term && term != "" && term != self._emptyText) {
							try {
								var eg = new RegExp(term, "i");
								arr = $.grep(self._options, function(n, i) {
									if (n.value == "") {
										return true;
									} else {
										return eg.test(n.text);
									}
								});
							} catch (e) {
								arr = $.grep(self._options, function(n, i) {
									if (n.value == "") {
										return true;
									} else {
										return n.text.indexOf(term) > -1;
									}
								});
							}
						} else {
							arr = self._options;
						}
						self._refreshOptions(arr, event, term);
					}
					return self;
				},
				open : function(event) {
					var self = this;
					if (!self.isOpen()) {
						self.element.parent().parent().addClass("zindexup").parent().addClass("zindexup");
						self.element.parent().show();

						self._isOpen = true;
						self._trigger('open', event);
					}
					/* 判断显示的位置 */
					if (self._input.offset().top + self._input.outerHeight() + self.element.parent().outerHeight() > $(window).height()
							+ $(document).scrollTop()) {
						self.element.parent().css( {
							top : "auto",
							bottom : 20
						});
					} else {
						self.element.parent().css( {
							top : 20,
							bottom : "auto"
						});
					}
					self.element.parent().bgiframe();
					return self;
				},
				isOpen : function() {
					return this._isOpen;
				},
				focus : function(event) {
					var self = this;
					self._trigger('focus', event);
					return self;
				},
				select : function(op, event) {
					var self = this;
					if (op) {
						op.attr("selected", true);
						self._input.val(op.text());
					} else {
						self._input.val(self.element.children(":selected").text());
					}

					self._trigger('select', event, op);
					return self;
				},
				close : function(event) {
					var self = this;
					if (event.target == self._arrow[0]) {
						return self;
					}

					if (self.isOpen()) {
						var v = self.element.children(":selected").text();
						if (v) {
							self._input.val(self.element.children(":selected").text());
						}

						self.element.parent().hide();
						self.element.parent().parent().removeClass("zindexup").parent().removeClass("zindexup");
						self._isOpen = false;
						self._trigger('close', event);
					}
					return self;
				},
				getEditer : function() {
					return this._input;
				},
				destroy : function() {
					this.element.unwrap().unbind("click.susdSelect").hide();
					this._input.unbind("click.susdSelect").unbind("keyup.susdSelect").unbind("focus.susdSelect").unbind("keydown.susdSelect").unbind(
							"blur.susdSelect");
					this._arrow.unbind("click.susdSelect");
					$.Widget.prototype.destroy.call(this);
				}
			});

	/*
	 * 用textarea 模拟input，用户存储有回车的大量文本
	 */
	$.fn.extend( {
		susdTextareaInit : function(title) {
			var self = $(this);
			if (!self.data("initSusdTextarea")) {
				self.susdTextarea( {
					title : title
				});
			}
		}
	});
	$.widget("susd.susdTextarea", {
		_dialog : null,
		_textarea : null,
		_create : function() {
			var self = this;
			self.element.data("initSusdTextarea", true).bind("click.susdTextarea", function(event) {
				self.open(event);
			}).bind("keyup.susdTextarea", function(event) {
				if (event.keyCode == 9) {
					self.open(event);
				}
			});
			self._dialog = $("<div></div>").css( {
				padding : 0,
				overflow : "hidden"
			}).dialog( {
				title : self.options.title,
				modal : true,
				height : 235,
				width : 330,
				autoOpen : false,
				resizable : false,
				open : function(event, ui) {
					if (self.element.attr("readonly")) {
						self._textarea.attr("readonly", true).blur();
						self._dialog.dialog("option", "buttons", {
							取消 : function(event) {
								self._dialog.dialog("close");
							}
						})
					} else {
						self._textarea.attr("readonly", false);
						self._dialog.dialog("option", "buttons", {
							确定 : function(event) {
								self.select(event);
							},
							取消 : function(event) {
								self._dialog.dialog("close");
							}
						})
					}
				},
				close : function(event, ui) {
					self.close(event);
				}
			}).css("padding", "5px");

			self._textarea = $("<textarea style='width:320px;height:135px;border:none;'></textarea>").appendTo(self._dialog);
		},
		open : function(event) {
			var self = this;
			self._dialog.dialog("open");
			self._textarea.val(self.element.val());
			self._trigger('open', event);
		},
		select : function(event) {
			var self = this;
			self.element.val(self._textarea.val()).focus();
			self._trigger('select', event, self.element.val());
			self._dialog.dialog("close");
		},
		close : function(event) {
			var self = this;
			self._trigger('close', event);
			self.element.focus();
		},
		destroy : function() {
			this.element.data("initSusdDatepicker", false).unbind("click.susdTextarea");
			this._textarea.remove();
			this._dialog.dialog("destroy").remove();
			$.Widget.prototype.destroy.call(this);
		}
	});

}(jQuery));
