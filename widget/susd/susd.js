function externalCall(a) {
	if ($.isFunction($.external[a])) {
		$.external[a].call(this, arguments)
	}
}(function($, s) {
	$.extend({
		external: {
			beforeCloseWin: function() {
				$.external.closeWin()
			},
			openWin: function(a) {
				a = $.extend({
					width: 900,
					height: 650,
					url: "#",
					modal: 0
				}, a);
				window.location.href = "execute:PoPupForm," + a.width + "," + a.height + "," + a.url + "," + a.modal
			},
			openPrintWin: function(a) {
				a = $.extend({
					width: 900,
					height: 650,
					url: "#",
					modal: 0,
					toolBar: 1
				}, a);
				window.location.href = "execute:OpenPrintForm," + a.width + "," + a.height + "," + a.url + "," + a.modal + "," + a.toolBar
			},
			closeWin: function(a) {
				a = $.extend({
					refresh: false,
					close: 1
				}, a);
				if (a.close) {
					if (a.refresh) {
						window.location.href = "execute:CloseFormAndRefreshParent"
					} else {
						window.location.href = "execute:CloseForm,1"
					}
				} else {
					if (a.refresh) {
						$.external.refreshParent()
					} else {
						window.location.href = "execute:CloseForm,0"
					}
				}
			},
			refreshParent: function() {
				window.location.href = "execute:RefreshParent"
			},
			refresh: function() {}
		}
	});
	window.susd = new function() {
		var d = 10;
		this.nextSequence = function() {
			return ++d
		};
		this.getSequence = function() {
			return d
		};
		var f = {};
		this.isCached = function(a) {
			return a in f
		};
		this.getCache = function(a) {
			return f[a]
		};
		this.putCache = function(a, b) {
			f[a] = b
		};
		this.removeCache = function(a) {
			delete f[a]
		};
		var g = null;
		var h;
		var i;
		var j;
		this.overlay = function(a, b) {
			function showOverlay() {
				g.dialog("open");
				j = setInterval(function() {
					i += 3;
					if (i > 100) {
						clearInterval(j)
					} else {
						h.progressbar("option", "value", i)
					}
				}, 60)
			}
			var c = $.extend({
				delay: 1000
			}, b);
			i = 0;
			if (a) {
				g.dialog("close");
				clearInterval(j);
				return
			}
			if (g == null) {
				g = $("<div></div>").dialog({
					width: '50%',
					height: 0,
					autoOpen: false,
					modal: true,
					resizable: false,
					draggable: false,
					open: function() {
						g.hide()
					}
				});
				h = g.prev().empty().removeClass().progressbar()
			}
			h.progressbar("option", "value", i);
			if (c.delay) {
				setTimeout(showOverlay, c.delay)
			} else {
				showOverlay()
			}
		};
		this.shield = function(c) {
			c = $.extend({
				mouseright: true,
				f5: false,
				backspace: false
			}, c);
			if (c.mouseright) {
				document.oncontextmenu = function(e) {
					return false
				}
			}
			if (c.f5) {
				$(document).bind("keydown.shieldF5", function(a) {
					a = a || window.event;
					if (a.keyCode == 116 || a.ctrlKey && a.keyCode == 82) {
						a.keyCode = 0;
						a.cancelBubble = false;
						a.returnValue = false;
						return false
					}
				})
			}
			if (c.backspace) {
				$(document).bind("keydown.shieldBackspace", function(a) {
					a = a || window.event;
					if (a.keyCode == 8) {
						var b = $(a.srcElement || a.target);
						if (b.is("input:enabled:not([readonly])") || b.is("textarea:enabled:not([readonly])")) {
							return true
						}
						a.keyCode = 0;
						a.cancelBubble = false;
						a.returnValue = false;
						return false
					}
				})
			}
		}
	};
	window.timer = new function() {
		var t;
		var d = null;
		this.begin = function() {
			t = [
				[new Date(), ""]
			]
		};
		this.append = function(a) {
			t.push([new Date(), a])
		};
		this.end = function(a) {
			var b = "";
			var c = (t[t.length - 1][0] - t[0][0]) / 100;
			c = -1;
			for (var i = 1; i < t.length; i++) {
				if ((t[i][0] - t[i - 1][0]) > c) {
					b += (t[i][0] - t[i - 1][0]) + "/" + ((t[i][0] - t[0][0])) + ":" + t[i][1] + "\n"
				}
			}
			if (d == null) {
				d = $("<div></div>").dialog({
					position: [10, 10],
					height: 200,
					buttons: {
						clear: function() {
							d.html("")
						}
					}
				})
			}
			d.prepend(b.replace(/\n/g, "<br/>") + "<hr/>").show()
		}
	};
	$.fn.extend({
		susdRightMenu: function(a, b) {
			var c = $(this);
			c.smartMenu(a, b);
			return c
		},
		susdInitTable: function(c) {
			var d = $(this);
			if (c) {
				d.find("thead>tr>th[sortcolumn=" + d.next().val() + "]").addClass(d.next().next().val() == "asc" ? "sortup" : "sortdown");
				d.find("thead > tr > th[sortcolumn]").css({
					"cursor": "pointer"
				}).append("<s class='sortIcon'></s>").hover(function() {
					$(this).addClass("hover")
				}, function() {
					$(this).removeClass("hover")
				}).click(function() {
					var a = $(this);
					var b;
					if (a.is(".sortup")) {
						a.removeClass("sortup");
						a.addClass("sortdown");
						b = "desc"
					} else if (a.is(".sortdown")) {
						a.removeClass("sortdown");
						a.addClass("sortup");
						b = "asc"
					} else {
						a.siblings("[sortcolumn]").removeClass("sortup").removeClass("sortdown");
						a.addClass("sortup");
						b = "asc"
					}
					d.next().val(a.attr("sortcolumn")).next().val(b);
					d.parent().next().children("input").val(1);
					d.parents("form").submit()
				})
			}
			d.find("tbody > tr:not(.ui-table-toggle-content)").hover(function() {
				$(this).addClass("hover")
			}, function() {
				$(this).removeClass("hover")
			});
			d.parent().next().find("li:has(a)").hover(function() {
				$(this).addClass("hover")
			}, function() {
				$(this).removeClass("hover")
			});
			return d
		},
		susdTurntoPage: function(a) {
			var b = (this);
			var c = b.parents(".tableScroll").next().children("input");
			if (a) {
				c.val(a)
			}
			b.parents("form").submit()
		},
		susdAutocomplete: function(o, q) {
			q = $.extend({
				useCache: true,
				selectOnly: false,
				param: {},
				select: function(a, b) {},
				change: function(a, b, c) {}
			}, q);
			var r = $(this);
			r.each(function() {
				var k = $(this);
				var l = k.next();
				if (l.attr("readonly")) {
					return
				}
				var m;
				l.autocomplete({
					'source': typeof o == "object" ? o : function(d, f) {
						var p = $.isFunction(q.param) ? q.param.call(k[0]) : q.param;
						var g = o + $.param(p);
						if (q.useCache && susd.isCached(g)) {
							var h = susd.getCache(g);
							if (d.term) {
								try {
									var j = new RegExp(d.term, "i");
									f($.grep(h, function(n, i) {
										return j.test(n.value)
									}))
								} catch (e) {
									f($.grep(h, function(n, i) {
										return n.value.indexOf(d.term) > -1
									}))
								}
							} else {
								f(h)
							}
							return
						}
						m = $.getJSON("autocomplete.ctrl", $.extend({
							"source": o
						}, p, d), function(a, b, c) {
							if (c === m) {
								if (q.useCache) {
									susd.putCache(g, a)
								}
								f(a)
							}
						})
					},
					minLength: 0,
					change: function(a, b) {
						if (b && b.item) {} else {
							var c = $(this).prev();
							if (this.value == "") {
								c.susdValidate({
									validate: function() {
										return false
									}
								})
							} else if (q.selectOnly) {
								c.susdValidate({
									validate: function() {
										return "请选择 " + q.selectOnly
									}
								})
							}
							k.val(this.value);
							c.susdValidate("validate")
						}
						q.change.call(k[0], a, b, l)
					},
					select: function(a, b) {
						var c = $(this).prev();
						c.susdValidate({
							validate: function() {
								return false
							}
						});
						k.val(b.item.key);
						c.susdValidate("validate");
						q.select(a, b)
					}
				});
				l.mousedown(function() {
					l.autocomplete("search", q.useCache ? "" : l.val())
				});
				l.siblings("s").click(function() {
					l.autocomplete("search", q.useCache ? "" : l.val())
				})
			});
			return r
		},
		susdCombogrid: function(c, d) {
			var e = $(this);
			d = $.extend({
				url: 'combogrid.ctrl?source=' + c,
				showOn: true,
				debug: false,
				autoChoose: true,
				close: function(a, b) {
					$(this).susdValidate("validate")
				}
			}, d);
			e.each(function() {
				var a = $(this);
				if (a.attr("readonly")) {
					return
				}
				a.combogrid(d)
			});
			return e
		},
		susdSubmit: function(b) {
			var c = $(this);
			if (c.is("form")) {
				var d = c.data("formFnArr");
				if (!d) {
					d = [];
					c.data("formFnArr", d);
					c.submit(function() {
						var a = c.data("formFnArr");
						for (var i in a) {
							if (!a[i].call(this)) {
								return false
							}
						}
						return true
					})
				}
				d.push(b)
			}
		}
	});
	$.widget("susd.susdTableToggle", {
		_clicktimeout: null,
		options: {
			delay: 300,
			load: function(a) {},
			open: function(a) {},
			close: function(a) {},
			dblclick: null
		},
		_create: function() {
			var b = this;
			b.element.find("tbody > tr:not(.ui-table-toggle-content)").bind("click.susdTableToggle", function(e) {
				if (e.target.tagName != "TD") {
					return
				}
				var a = this;
				if ($.isFunction(b.options.dblclick)) {
					clearTimeout(b._clicktimeout);
					b._clicktimeout = setTimeout(function() {
						b.toggle(a)
					}, b.options.delay)
				} else {
					b.toggle(a)
				}
			}).bind("dblclick.susdTableToggle", function() {
				clearTimeout(b._clicktimeout);
				if ($.isFunction(b.options.dblclick)) {
					b.options.dblclick.call(this)
				}
			});
			return b
		},
		toggle: function(a) {
			var b = this;
			var c = $(a);
			var d = c.next();
			if (d.is(".ui-table-toggle-content")) {
				var e = d.children("td");
				if (d.is(":visible")) {
					b.close(a)
				} else {
					b.open(a)
				}
			} else {
				d = $("<tr class='ui-table-toggle-content'><td colspan='" + c.children("td").size() + "'></td></tr>");
				c.after(d);
				if ($.isFunction(b.options.load)) {
					b.options.load.call(a, d.children("td"))
				}
				b.open(a)
			}
			return b
		},
		open: function(a) {
			var b = this;
			var c = $(a);
			var d = c.next();
			c.siblings(".ui-table-toggle-content:visible").each(function() {
				b.close($(this).prev())
			});
			d.show();
			c.addClass("active");
			if ($.isFunction(b.options.open)) {
				b.options.open.call(a, d.children("td"))
			}
			return b
		},
		close: function(a) {
			var b = this;
			var c = $(a);
			var d = c.next();
			d.hide();
			c.removeClass("active");
			if ($.isFunction(b.options.close)) {
				b.options.close.call(a, d.children("td"))
			}
			return b
		}
	});
	$.widget("susd.susdTip", {
		_isOpen: false,
		_tip: null,
		_panel: null,
		options: {
			hover: false,
			create: $.noop,
			open: $.noop,
			close: $.noop
		},
		_create: function() {
			var a = this,
				options = a.options;
			a._tip = $("<div class='messageBox'></div>");
			a._panel = $("<div></div>");
			a.element.after(a._tip);
			if (options.hover) {
				a.element.hover(function() {
					a.open()
				}, function() {
					a.close()
				})
			} else {
				var b = $("<a class='closeBtn' href='javascript:$.noop();'></a>");
				b.click(function() {
					a.close()
				});
				a._tip.append(b);
				a.element.click(function() {
					if (a.isOpen()) {
						a.close()
					} else {
						a.open()
					}
					return false
				})
			}
			a._tip.append(a._panel);
			return a
		},
		open: function() {
			var a = this;
			a._tip.show();
			a._isOpen = true;
			a._trigger('open');
			if (a.element.offset().top + a._tip.outerHeight() > $(window).height() + $(document).scrollTop()) {
				a._tip.css("margin-top", a.element.height() + 10 - a._tip.outerHeight())
			} else {
				a._tip.css("margin-top", -4)
			}
			return a
		},
		close: function() {
			var a = this;
			a._tip.hide();
			a._isOpen = false;
			a._trigger('close');
			return a
		},
		isOpen: function() {
			return this._isOpen
		},
		getPanel: function() {
			return this._panel
		}
	});
	$.widget("susd.susdSelect", {
		_onBox: false,
		options: {
			delay: 300,
			selectOnly: true,
			source: null
		},
		_input: null,
		_arrow: null,
		_options: null,
		_emptyText: null,
		_isOpen: false,
		_create: function() {
			var c = this;
			if (c.element.is("[selectonly]")) {
				c.options.selectOnly = c.element.attr("selectonly") == "true"
			}
			c._input = c.element.next();
			c._arrow = c._input.next();
			c._options = [];
			c.element.children().each(function() {
				if (!this.value) {
					c._emptyText = this.text
				}
				c._options.push(this)
			});
			if (!c._emptyText) {
				c._emptyText = "";
				c._options.unshift($("<option value=''>" + c._emptyText + "</option>")[0]);
				c.element.prepend(c._options[0])
			}
			if (c._input.val() == "") {
				c.element.val("");
				c._input.val(c._emptyText)
			} else if ($.trim(c._input.val()) != c.element.children(":selected").text()) {
				c.element.val("")
			}
			c.element.wrap("<div style='position:absolute;display:none;left:0;'></div>");
			c.element.show().parent().hover(function() {
				c._onBox = true
			}, function() {
				c._onBox = false
			});
			c.element.bind("click.susdSelect", function(a) {
				c.select(null, a);
				c.close(a)
			}).bind();
			c._input.bind("click.susdSelect", function(a) {
				if (c.isOpen()) {
					c.close(a)
				} else {
					c.search(this.value, a)
				}
			}).bind("keyup.susdSelect", function(a) {
				if (c._input.attr("readonly")) {
					return
				}
				switch (a.keyCode) {
				case 38:
					var b = c.element.children(":selected").prevAll(":first");
					if (!b.is("option")) {
						b = c.element.children(":last")
					}
					c.select(b, a);
					break;
				case 40:
					var b = c.element.children(":selected").nextAll(":first");
					if (!b.is("option")) {
						b = c.element.children(":first")
					}
					c.select(b, a);
					break;
				case 13:
					if (c.options.term == c._input.val()) {
						c.close(a);
						break
					}
				default:
					c.search(this.value, a)
				}
			}).bind("focus.susdSelect", function(a) {
				c.focus(a)
			}).bind("keydown.susdSelect", function(a) {
				if (c._input.attr("readonly")) {
					return
				}
				switch (a.keyCode) {
				case 9:
					c.close(a);
					break;
				default:
					if (this.value == c._emptyText) {
						this.value = ""
					}
				}
			}).bind("blur.susdSelect", function(a) {
				if (!c._onBox) {
					c.close(a)
				}
			});
			c._arrow.bind("click.susdSelect", function() {
				c._input.focus();
				c._input.click()
			});
			return c
		},
		_refreshOptions: function(a, b, c) {
			var d = this;
			d.options.term = c;
			d.element.children().remove();
			$(a).each(function() {
				d.element.append(this)
			});
			try {
				d.element.children(":selected").removeAttr("selected")
			} catch (e) {
				d.element[0].value = null
			}
			d.element.children().each(function() {
				if (d._input.val().toLowerCase() == $(this).text().toLowerCase()) {
					d.select($(this), b);
					return false
				}
			});
			if (d.options.selectOnly) {
				if (!d.element.val()) {
					d.element.val(d.element.children("[value!=]:first").val())
				}
			}
			d.element.attr("size", Math.max(2, Math.min(10, d.element.children().size())));
			d._trigger('search', b, c);
			d.open(b);
			return d
		},
		search: function(c, d) {
			var f = this;
			if (f._input.attr("readonly")) {
				return f
			}
			if (typeof f.options.source === "string") {
				clearTimeout(f.searching);
				f.searching = setTimeout(function() {
					if (c == f._emptyText) {
						c = ""
					}
					if (f.options.term != c) {
						f.options.term = c;
						if (f.xhr) {
							f.xhr.abort()
						}
						var p = {};
						if ($.isFunction(f.options.param)) {
							p = f.options.param.call(f.element[0], c)
						} else {
							p = f.options.param
						}
						f.xhr = $.ajax({
							url: "autocomplete.ctrl?source=" + f.options.source,
							data: $.extend({}, p, {
								term: c
							}),
							dataType: "json",
							success: function(a) {
								var b = [f._options[0]];
								$(a).each(function() {
									b.push($("<option></option>").val(this.key).text(this.value))
								});
								f._refreshOptions(b, d, c);
								if (!f.options.selectOnly) {
									f.element.susdValidate("validate")
								}
							},
							error: function() {
								f._refreshOptions([f._options[0]], d, c)
							}
						})
					} else {
						f.open(d)
					}
				}, f.options.delay)
			} else {
				var g;
				if (c && c != "" && c != f._emptyText) {
					try {
						var h = new RegExp(c, "i");
						g = $.grep(f._options, function(n, i) {
							if (n.value == "") {
								return true
							} else {
								return h.test(n.text)
							}
						})
					} catch (e) {
						g = $.grep(f._options, function(n, i) {
							if (n.value == "") {
								return true
							} else {
								return n.text.indexOf(c) > -1
							}
						})
					}
				} else {
					g = f._options
				}
				f._refreshOptions(g, d, c)
			}
			return f
		},
		open: function(a) {
			var b = this;
			if (!b.isOpen()) {
				b.element.parent().parent().addClass("zindexup").parent().addClass("zindexup");
				b.element.parent().show();
				b._isOpen = true;
				b._trigger('open', a)
			}
			if (b._input.offset().top + b._input.outerHeight() + b.element.parent().outerHeight() > $(window).height() + $(document).scrollTop()) {
				b.element.parent().css({
					top: "auto",
					bottom: 20
				})
			} else {
				b.element.parent().css({
					top: 20,
					bottom: "auto"
				})
			}
			b.element.parent().bgiframe();
			return b
		},
		isOpen: function() {
			return this._isOpen
		},
		focus: function(a) {
			var b = this;
			b._trigger('focus', a);
			return b
		},
		select: function(a, b) {
			var c = this;
			if (a) {
				a.attr("selected", true);
				c._input.val(a.text())
			} else {
				c._input.val(c.element.children(":selected").text())
			}
			return c
		},
		close: function(a) {
			var b = this;
			if (a.target == b._arrow[0]) {
				return b
			}
			clearTimeout(b.searching);
			if (b.xhr) {
				b.xhr.abort()
			}
			if (b.isOpen()) {
				if (b.options.selectOnly) {
					b._input.val(b.element.children(":selected").text())
				}
				if (b.element.val() != null) {
					b._trigger('select', a, b.element.children(":selected"))
				}
				b.element.parent().hide();
				b.element.parent().parent().removeClass("zindexup").parent().removeClass("zindexup");
				b._isOpen = false;
				b._trigger('close', a)
			}
			b._onBox = false;
			return b
		},
		getEditer: function() {
			return this._input
		},
		destroy: function() {
			clearTimeout(self.searching);
			if (self.xhr) {
				self.xhr.abort()
			}
			this.element.unwrap().unbind("click.susdSelect").hide();
			this._input.unbind("click.susdSelect").unbind("keyup.susdSelect").unbind("focus.susdSelect").unbind("keydown.susdSelect").unbind("blur.susdSelect");
			this._arrow.unbind("click.susdSelect");
			$.Widget.prototype.destroy.call(this)
		}
	});
	$.fn.extend({
		susdTextareaInit: function(a) {
			var b = $(this);
			if (!b.data("initSusdTextarea")) {
				b.susdTextarea({
					title: a
				})
			}
		}
	});
	$.widget("susd.susdTextarea", {
		_dialog: null,
		_textarea: null,
		_create: function() {
			var d = this;
			d.element.data("initSusdTextarea", true).bind("click.susdTextarea", function(a) {
				d.open(a)
			}).bind("keyup.susdTextarea", function(a) {
				if (a.keyCode == 9) {
					d.open(a)
				}
			});
			d._dialog = $("<div></div>").css({
				padding: 0,
				overflow: "hidden"
			}).dialog({
				title: d.options.title,
				modal: true,
				height: 235,
				width: 330,
				autoOpen: false,
				resizable: false,
				open: function(b, c) {
					if (d.element.attr("readonly")) {
						d._textarea.attr("readonly", true).blur();
						d._dialog.dialog("option", "buttons", {取消: function(a) {
								d._dialog.dialog("close")
							}
						})
					} else {
						d._textarea.attr("readonly", false);
						d._dialog.dialog("option", "buttons", {确定: function(a) {
								d.select(a)
							},
							取消: function(a) {
								d._dialog.dialog("close")
							}
						})
					}
				},
				close: function(a, b) {
					d.close(a)
				}
			}).css("padding", "5px");
			d._textarea = $("<textarea style='width:320px;height:135px;border:none;'></textarea>").appendTo(d._dialog)
		},
		open: function(a) {
			var b = this;
			b._dialog.dialog("open");
			b._textarea.val(b.element.val());
			b._trigger('open', a)
		},
		select: function(a) {
			var b = this;
			b.element.val(b._textarea.val()).focus();
			b._trigger('select', a, b.element.val());
			b._dialog.dialog("close")
		},
		close: function(a) {
			var b = this;
			b._trigger('close', a);
			b.element.focus()
		},
		destroy: function() {
			this.element.data("initSusdDatepicker", false).unbind("click.susdTextarea");
			this._textarea.remove();
			this._dialog.dialog("destroy").remove();
			$.Widget.prototype.destroy.call(this)
		}
	})
}(jQuery));