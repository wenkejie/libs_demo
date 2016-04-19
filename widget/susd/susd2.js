(function($, undefined) {
	$.widget("cg.combogrid", {
		options: {
			param: null,
			resetButton: false,
			resetFields: null,
			searchButton: false,
			searchIcon: false,
			okIcon: false,
			alternate: false,
			appendTo: "body",
			autoFocus: false,
			autoChoose: true,
			delayChoose: 300,
			delay: 300,
			rows: 5,
			addClass: null,
			addId: null,
			minLength: 0,
			position: {
				my: "left top",
				at: "left bottom",
				collision: "none"
			},
			url: null,
			colModel: null,
			sidx: "",
			sord: "",
			datatype: "json",
			debug: false,
			i18n: false,
			draggable: false,
			rememberDrag: false,
			rowsArray: [10],
			showOn: false,
			width: null
		},
		source: null,
		lastOrdered: "",
		cssCol: "",
		pending: 0,
		page: 1,
		rowNumber: 0,
		pos: null,
		_create: function() {
			var self = this,
				doc = this.element[0].ownerDocument,
				suppressKeyPress;
			if (self.options.resetButton) {
				this.element.after('<span class="ui-state-default ui-corner-all ' + self.element.attr('id') + ' cg-resetButton"><span class="ui-icon ui-icon-circle-close"></span></span>');
				$('.' + self.element.attr('id') + '.cg-resetButton', self.menucombo.element).bind('click.combogrid', function() {
					self.element.val('');
					self.term = self.element.val();
					if (self.options.okIcon) {
						$('.' + self.element.attr('id') + '.ok-icon', self.menucombo.element).remove();
						$('.' + self.element.attr('id') + '.notok-icon', self.menucombo.element).remove();
						if (self.options.resetButton) {
							$('.' + self.element.attr('id') + '.cg-resetButton', self.menucombo.element).after('<span class="' + self.element.attr('id') + ' notok-icon"></span>')
						} else if (self.options.searchButton) {
							$('.' + self.element.attr('id') + '.cg-searchButton', self.menucombo.element).after('<span class="' + self.element.attr('id') + ' notok-icon"></span>')
						} else {
							self.element.after('<span class="' + self.element.attr('id') + ' notok-icon"></span>')
						}
					}
					self.element.trigger('keyup');
					if (self.options.resetFields != null) {
						$.each(self.options.resetFields, function() {
							$('' + this).val('')
						})
					}
				})
			}
			if (self.options.searchButton) {
				this.element.after('<span class="ui-state-default ui-corner-all ' + self.element.attr('id') + ' cg-searchButton"><span class="ui-icon ui-icon-search"></span></span>');
				$('.' + self.element.attr('id') + '.cg-searchButton', self.menucombo.element).bind('click.combogrid', function() {
					self.element.trigger('focus.combogrid');
					self._search(self.element.val());
					self.element.trigger('focus.combogrid')
				})
			}
			if (self.options.showOn) {
				this.element.focus(function() {
					self._search(self.element.val())
				})
			}
			this.element.addClass("ui-autocomplete-input").attr("autocomplete", "off").attr({
				role: "textbox",
				"aria-autocomplete": "list",
				"aria-haspopup": "true"
			}).bind("keydown.combogrid", function(event) {
				if (self.options.disabled || self.element.attr("readonly")) {
					return
				}
				suppressKeyPress = false;
				var keyCode = $.ui.keyCode;
				switch (event.keyCode) {
				case keyCode.LEFT:
					$('.' + self.element.attr('id') + '.cg-keynav-prev', self.menucombo.element).trigger('click.combogrid');
					break;
				case keyCode.PAGE_UP:
					self._move("previousPage", event);
					break;
				case keyCode.RIGHT:
					$('.' + self.element.attr('id') + '.cg-keynav-next', self.menucombo.element).trigger('click.combogrid');
					break;
				case keyCode.PAGE_DOWN:
					self._move("nextPage", event);
					break;
				case keyCode.UP:
					self._move("previous", event);
					event.preventDefault();
					break;
				case keyCode.DOWN:
					self._move("next", event);
					event.preventDefault();
					break;
				case keyCode.ENTER:
				case keyCode.NUMPAD_ENTER:
					if (self.menucombo.active) {
						suppressKeyPress = true;
						event.preventDefault()
					}
				case keyCode.TAB:
					if (!self.menucombo.active) {
						return
					}
					self.menucombo.select(event);
					break;
				case keyCode.DELETE:
					if (self.options.okIcon) {
						$('.' + self.element.attr('id') + '.ok-icon', self.menucombo.element).remove();
						$('.' + self.element.attr('id') + '.notok-icon', self.menucombo.element).remove();
						if (self.options.resetButton) {
							$('.' + self.element.attr('id') + '.cg-resetButton', self.menucombo.element).after('<span class="' + self.element.attr('id') + ' notok-icon"></span>')
						} else if (self.options.searchButton) {
							$('.' + self.element.attr('id') + '.cg-searchButton', self.menucombo.element).after('<span class="' + self.element.attr('id') + ' notok-icon"></span>')
						} else {
							self.element.after('<span class="' + self.element.attr('id') + ' notok-icon"></span>')
						}
					}
					if (self.options.resetFields != null) {
						$.each(self.options.resetFields, function() {
							$('' + this).val('')
						})
					}
					clearTimeout(self.searching);
					self.searching = setTimeout(function() {
						if (self.term != self.element.val()) {
							self.selectedItem = null;
							self.search(null, event)
						}
					}, self.options.delay);
					break;
				case keyCode.ESCAPE:
					self.element.val(self.term);
					self.close(event);
					$('.' + self.element.attr('id') + '.ok-icon', self.menucombo.element).remove();
					$('.' + self.element.attr('id') + '.notok-icon', self.menucombo.element).remove();
					if (self.options.okIcon) {
						if (self.options.resetButton) {
							$('.' + self.element.attr('id') + '.cg-resetButton', self.menucombo.element).after('<span class="' + self.element.attr('id') + ' ok-icon"></span>')
						} else if (self.options.searchButton) {
							$('.' + self.element.attr('id') + '.cg-searchButton', self.menucombo.element).after('<span class="' + self.element.attr('id') + ' ok-icon"></span>')
						} else {
							self.element.after('<span class="' + self.element.attr('id') + ' ok-icon"></span>')
						}
					}
					break;
				default:
					if (self.options.okIcon) {
						$('.' + self.element.attr('id') + '.ok-icon', self.menucombo.element).remove();
						$('.' + self.element.attr('id') + '.notok-icon', self.menucombo.element).remove();
						if (self.options.resetButton) {
							$('.' + self.element.attr('id') + '.cg-resetButton', self.menucombo.element).after('<span class="' + self.element.attr('id') + ' notok-icon"></span>')
						} else if (self.options.searchButton) {
							$('.' + self.element.attr('id') + '.cg-searchButton', self.menucombo.element).after('<span class="' + self.element.attr('id') + ' notok-icon"></span>')
						} else {
							self.element.after('<span class="' + self.element.attr('id') + ' notok-icon"></span>')
						}
					}
					clearTimeout(self.searching);
					self.searching = setTimeout(function() {
						self.selectedItem = null;
						self.search(null, event)
					}, self.options.delay);
					break
				}
			}).bind("keypress.combogrid", function(event) {
				if (suppressKeyPress) {
					suppressKeyPress = false;
					event.preventDefault()
				}
			}).bind("focus.combogrid", function() {
				if (self.options.disabled) {
					return
				}
				self.selectedItem = null;
				self.previous = self.element.val()
			}).bind("blur.combogrid", function(event) {
				if (self.options.disabled) {
					return
				}
				if (self.options.searchButton) {
					if (self.menucombo.element.is(":visible")) {
						clearTimeout(self.searching);
						self.closing = setTimeout(function() {
							self.close(event);
							self._change(event)
						}, 70)
					}
				} else {
					clearTimeout(self.searching);
					self.closing = setTimeout(function() {
						self.close(event);
						self._change(event)
					}, 150)
				}
			});
			if (this.options.searchIcon) {
				this.element.addClass("input-bg")
			}
			this.options.source = function(request, response) {
				var data = {
					sidx: self.options.sidx,
					page: self.page,
					sord: self.options.sord,
					rows: self.options.rows,
					searchTerm: request.term
				};
				var p = {};
				if ($.isFunction(self.options.param)) {
					p = self.options.param.call(request.term)
				} else {
					p = self.options.param
				}
				data = $(this).jsonExtend({}, [data, p]);
				$.ajax({
					url: self.options.url,
					dataType: self.options.datatype,
					data: data,
					success: function(data) {
						if (data.records == 0) {
							self.pending--;
							if (!self.pending) {
								self.element.removeClass("cg-loading");
								self.close()
							}
						} else if (data.records == 1) {
							response(data.count, data.pageCount, $.map(data.list, function(item) {
								return item
							}));
							self.menucombo.activate($.Event({
								type: "mouseenter"
							}), self.menucombo.element.children(".cg-menu-item:first"));
							if (self.options.autoChoose) {
								setTimeout(function() {
									self.menucombo._trigger("selected", $.Event({
										type: "click"
									}), {
										item: self.menucombo.active
									})
								}, self.options.delayChoose)
							}
						} else {
							var newMap = $.map(data.list, function(item) {
								return item
							});
							response(data.count, data.pageCount, $.map(data.list, function(item) {
								return item
							}))
						}
					}
				})
			};
			this._initSource();
			this.response = function() {
				return self._response.apply(self, arguments)
			};
			this.menucombo = $("<div></div>").addClass("cg-autocomplete").appendTo($(this.options.appendTo || "body", doc)[0]).mousedown(function(event) {
				var menuElement = self.menucombo.element[0];
				if (!$(event.target).closest(".cg-menu-item").length) {
					setTimeout(function() {
						$(document).one('mousedown', function(event) {
							if (event.target !== self.element[0] && event.target !== menuElement && !$.ui.contains(menuElement, event.target)) {
								self.close()
							}
						})
					}, 1)
				}
				setTimeout(function() {
					clearTimeout(self.closing)
				}, 13)
			}).menucombo({
				focus: function(event, ui) {
					var item = ui.item.data("item.combogrid");
					if (false !== self._trigger("focus", event, {
						item: item
					})) {
						if (/^key/.test(event.originalEvent.type)) {
							if (item.value != undefined) self.element.val(item.value)
						}
					}
				},
				selected: function(event, ui) {
					var item = ui.item.data("item.combogrid"),
						previous = self.previous;
					if (self.element[0] !== doc.activeElement) {
						if (!self.options.showOn) {
							self.element.focus()
						}
						self.previous = previous;
						setTimeout(function() {
							self.previous = previous;
							self.selectedItem = item
						}, 1)
					}
					if (false !== self._trigger("select", event, {
						item: item
					})) {
						self.element.val(item.value)
					}
					self.term = self.element.val();
					self.close(event);
					self.selectedItem = item;
					if (self.options.okIcon) {
						$('.' + self.element.attr('id') + '.ok-icon', self.menucombo.element).remove();
						$('.' + self.element.attr('id') + '.notok-icon', self.menucombo.element).remove();
						if (self.options.resetButton) {
							$('.' + self.element.attr('id') + '.cg-resetButton', self.menucombo.element).after('<span class="' + self.element.attr('id') + ' ok-icon"></span>')
						} else if (self.options.searchButton) {
							$('.' + self.element.attr('id') + '.cg-searchButton', self.menucombo.element).after('<span class="' + self.element.attr('id') + ' ok-icon"></span>')
						} else {
							self.element.after('<span class="' + self.element.attr('id') + ' ok-icon"></span>')
						}
					}
				},
				blur: function(event, ui) {
					if (self.menucombo.element.is(":visible") && (self.element.val() !== self.term)) {}
				}
			}).zIndex(this.element.zIndex() + 1).css({
				top: 0,
				left: 0
			}).hide().bgiframe().data("menucombo");
			if (this.options.draggable) {
				this.menucombo.element.draggable({
					stop: function(event, ui) {
						self.pos = ui.position
					}
				})
			}
			if ($.fn.bgiframe) {
				this.menucombo.element.bgiframe()
			}
			if (this.options.addClass != null) {
				this.menucombo.element.addClass(this.options.addClass)
			}
			if (this.options.addId != null) {
				this.menucombo.element.attr('id', this.options.addId)
			}
		},
		destroy: function() {
			this.element.removeClass("cg-autocomplete-input").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");
			this.menucombo.element.remove();
			$.Widget.prototype.destroy.call(this)
		},
		_setOption: function(key, value) {
			$.Widget.prototype._setOption.apply(this, arguments);
			if (key === "source") {
				this._initSource()
			}
			if (key === "appendTo") {
				this.menucombo.element.appendTo($(value || "body", this.element[0].ownerDocument)[0])
			}
			if (key === "disabled" && value && this.xhr) {
				this.xhr.abort()
			}
		},
		_initSource: function() {
			var self = this,
				array, url;
			if ($.isArray(this.options.source)) {
				array = this.options.source;
				this.source = function(request, response) {
					response($.cg.combogrid.filter(array, request.term))
				}
			} else if (typeof this.options.source === "string") {
				url = this.options.source;
				this.source = function(request, response) {
					if (self.xhr) {
						self.xhr.abort()
					}
					self.xhr = $.ajax({
						url: url,
						data: request,
						dataType: "json",
						success: function(data, status, xhr) {
							if (xhr === self.xhr) {
								response(data)
							}
							self.xhr = null
						},
						error: function(xhr) {
							if (xhr === self.xhr) {
								response([])
							}
							self.xhr = null
						}
					})
				}
			} else {
				this.source = this.options.source
			}
		},
		search: function(value, event) {
			value = value != null ? value : this.element.val();
			this.page = 1;
			this.term = this.element.val();
			if (value.length < this.options.minLength) {
				return this.close(event)
			}
			clearTimeout(this.closing);
			if (this._trigger("search", event) === false) {
				return
			}
			if (!this.options.searchButton) {
				return this._search(value)
			}
		},
		_search: function(value) {
			this.pending++;
			this.element.addClass("cg-loading");
			this.source({
				term: value
			}, this.response)
		},
		_response: function(records, total, content) {
			if (!this.options.disabled && content && content.length) {
				this._suggest(records, total, content);
				this._trigger("open")
			} else {
				this.close()
			}
			this.pending--;
			if (!this.pending) {
				this.element.removeClass("cg-loading")
			}
		},
		close: function(event) {
			var self = this;
			self.page = 1;
			clearTimeout(this.closing);
			if (this.menucombo.element.is(":visible")) {
				this.menucombo.element.hide();
				this.menucombo.deactivate();
				$('.' + self.element.attr('id') + '.cg-keynav-next', self.menucombo.element).unbind('click.combogrid');
				$('.' + self.element.attr('id') + '.cg-keynav-prev', self.menucombo.element).unbind('click.combogrid');
				$('.' + self.element.attr('id') + '.cg-keynav-last', self.menucombo.element).unbind('click.combogrid');
				$('.' + self.element.attr('id') + '.cg-keynav-first', self.menucombo.element).unbind('click.combogrid');
				if (!this.options.debug) this.menucombo.element.empty();
				this.options.sidx = self.options.sidx;
				this.cssCol = "";
				this.lastOrdered = "";
				if (!this.options.rememberDrag) {
					this.pos = null
				}
				this._trigger("close", event)
			}
		},
		_change: function(event) {
			if (this.previous !== this.element.val()) {
				this._trigger("change", event, {
					item: this.selectedItem
				})
			}
		},
		_normalize: function(items) {
			if (items.length && items[0].label && items[0].value) {
				return items
			}
			return $.map(items, function(item) {
				if (typeof item === "string") {
					return {
						label: item,
						value: item
					}
				}
				return $.extend({
					value: $.parseJSON(item)
				}, item)
			})
		},
		_suggest: function(records, total, items) {
			var self = this;
			var ul = this.menucombo.element.empty().zIndex(this.element.zIndex() + 1);
			$('.' + self.element.attr('id') + '.cg-keynav-next', self.menucombo.element).unbind('click.combogrid');
			$('.' + self.element.attr('id') + '.cg-keynav-prev', self.menucombo.element).unbind('click.combogrid');
			$('.' + self.element.attr('id') + '.cg-keynav-last', self.menucombo.element).unbind('click.combogrid');
			$('.' + self.element.attr('id') + '.cg-keynav-first', self.menucombo.element).unbind('click.combogrid');
			$('.cg-colHeader-label').unbind('click.combogrid', self.menucombo.element);
			this._renderHeader(ul, this.options.colModel);
			this._renderMenu(ul, items, this.options.colModel);
			this._renderPager(ul, records, total);
			this.menucombo.deactivate();
			this.menucombo.refresh();
			ul.show();
			this._resizeMenu();
			if (this.pos == null) {
				ul.position($.extend({
					of: this.element
				}, this.options.position))
			}
			if (this.options.autoFocus) {
				this.menucombo.next(new $.Event("mouseover"))
			}
		},
		_resizeMenu: function() {
			var ul = this.menucombo.element;
			if (this.options.width != null) {
				ul.css('width', this.options.width)
			} else {
				ul.outerWidth(Math.max(ul.width("").outerWidth(), this.element.outerWidth()))
			}
		},
		_renderHeader: function(ul, colModel) {
			var self = this;
			div = $('<div id="cg-divHeader" class="ui-state-default">', self.menucombo.element);
			$.each(colModel, function(index, col) {
				if (col.width == undefined) {
					col.width = 100 / colModel.length
				}
				if (col.align == undefined) {
					col.align = "center"
				}
				var hide = "";
				if (col.hide != undefined && col.hide) {
					hide = "display:none;";
					if (col.width != undefined) col.width = 0
				}
				if (col.columnName == self.cssCol) {
					div.append('<div class="cg-colHeader" style="width:' + col.width + '%;' + hide + ' text-align:' + col.align + '"><label class="cg-colHeader-label" id="' + col.columnName + '">' + self._renderLabel(col.label) + '</label><span class="cg-colHeader ' + self.options.sord + '"></span></div>')
				} else {
					div.append('<div class="cg-colHeader" style="width:' + col.width + '%;' + hide + ' text-align:' + col.align + '"><label class="cg-colHeader-label" id="' + col.columnName + '">' + self._renderLabel(col.label) + '</label></div>')
				}
			});
			div.append('</div').appendTo(ul);
			if (this.options.draggable) {
				$('#cg-divHeader').css("cursor", "move")
			}
			$(".cg-colHeader-label", self.menucombo.element).bind('click.combogrid', function() {
				self.options.sord = "";
				self.cssCol = "";
				value = $(this).attr('id');
				self.cssCol = value;
				if (self.lastOrdered == value) {
					self.lastOrdered = "";
					self.options.sord = "desc"
				} else {
					self.lastOrdered = value;
					self.options.sord = "asc"
				}
				self.options.sidx = value;
				self._search(self.term)
			})
		},
		_renderLabel: function(label) {
			if (this.options.i18n) {
				return $.i18n.prop(label)
			} else {
				return label
			}
		},
		_renderMenu: function(ul, items, colModel) {
			var self = this;
			$.each(items, function(index, item) {
				self._renderItem(ul, item, colModel)
			})
		},
		_renderItem: function(ul, item, colModel) {
			var self = this;
			this.rowNumber++;
			div = $("<div class='cg-colItem'>");
			$.each(colModel, function(index, col) {
				if (col.width == undefined) {
					col.width = 100 / colModel.length
				}
				if (col.align == undefined) {
					col.align = "center"
				}
				var hide = "";
				if (col.hide != undefined && col.hide) {
					hide = "display:none;"
				}
				if (item[col.columnName] != null && typeof item[col.columnName] === "object") {
					subItem = item[col.columnName];
					$("<div style='width:" + col.width + "%;" + hide + " text-align:" + col.align + "' class='cg-DivItem'>" + subItem[col.subName] + "</div>").appendTo(div)
				} else {
					$("<div style='width:" + col.width + "%;" + hide + " text-align:" + col.align + "' class='cg-DivItem'>" + item[col.columnName] + "</div>").appendTo(div)
				}
			});
			div.append("</div>");
			if (self.options.alternate) {
				if (this.rowNumber % 2 == 0) {
					return $("<div class='cg-comboItem-even'></div>").data("item.combogrid", item).append(div).appendTo(ul)
				} else {
					return $("<div class='cg-comboItem-odd'></div>").data("item.combogrid", item).append(div).appendTo(ul)
				}
			} else {
				return $("<div class='cg-comboItem'></div>").data("item.combogrid", item).append(div).appendTo(ul)
			}
		},
		_renderPager: function(ul, records, total) {
			var self = this;
			var initRecord = ((self.page * self.options.rows) - self.options.rows) + 1;
			var lastRecord = 0;
			if (self.page < total) {
				lastRecord = (self.page * self.options.rows)
			} else {
				lastRecord = records
			}
			div = $("<div class='cg-comboButton ui-state-default'>");
			$("<table cellspacing='0' cellpadding='0' border='0' class='cg-navTable'>" + "<tbody>" + "<td align='center' style='white-space: pre; width: 264px;' id='cg-keynav-center'>" + "<table cellspacing='0' cellpadding='0' border='0' class='cg-pg-table' style='table-layout: auto;'>" + "<tbody>" + "<tr>" + "<td class='cg-pg-button ui-corner-all cg-state-disabled cg-keynav-first " + self.element.attr('id') + "'>" + "<span class='ui-icon ui-icon-seek-first'></span>" + "</td>" + "<td class='cg-pg-button ui-corner-all cg-state-disabled cg-keynav-prev " + self.element.attr('id') + "'>" + "<span class='ui-icon ui-icon-seek-prev'></span>" + "</td>" + "<td style='width: 4px;' class='cg-state-disabled'>" + "<span class='ui-separator'></span>" + "</td>" + "<td dir='ltr' id='cg-navInfo'>" + self._renderPagerPage('page', self.page, total) + "</td>" + "<td style='width: 4px;' class='cg-state-disabled'>" + "<span class='ui-separator'></span>" + "</td>" + "<td class='cg-pg-button ui-corner-all " + self.element.attr('id') + "'>" + "<span class='ui-icon ui-icon-refresh " + self.element.attr('id') + " pageRedirct'></span>" + "</td>" + "<td class='cg-pg-button ui-corner-all cg-keynav-next " + self.element.attr('id') + "'>" + "<span class='ui-icon ui-icon-seek-next'></span>" + "</td>" + "<td class='cg-pg-button ui-corner-all cg-keynav-last " + self.element.attr('id') + "'>" + "<span class='ui-icon ui-icon-seek-end'></span>" + "</td>" + "<td dir='ltr' style='display:none;'>" + "<select class='" + self.element.attr('id') + " recordXP'>" + "</select>" + "</td>" + "</tr>" + "</tbody>" + "</table>" + "</td>" + "<td align='right' id='cg-keynav-right'>" + "<div class='ui-paging-info' style='text-align: right;' dir='ltr'>" + self._renderPagerView('recordtext', initRecord, lastRecord, records) + "</div>" + "</td>" + "</tr>" + "</tbody>" + "</table>").appendTo(div);
			div.append("</div>");
			div.appendTo(ul);
			$.each(self.options.rowsArray, function(index, value) {
				$('.' + self.element.attr('id') + '.recordXP', self.menucombo.element).append("<option value='" + value + "' role='option'>" + value + "</option>")
			});
			$('.' + self.element.attr('id') + '.recordXP', self.menucombo.element).val(self.options.rows);
			if (self.page > 1) {
				$('.' + self.element.attr('id') + '.cg-keynav-first', self.menucombo.element).removeClass("cg-state-disabled");
				$('.' + self.element.attr('id') + '.cg-keynav-prev', self.menucombo.element).removeClass("cg-state-disabled")
			} else {
				$('.' + self.element.attr('id') + '.cg-keynav-first', self.menucombo.element).addClass("cg-state-disabled");
				$('.' + self.element.attr('id') + '.cg-keynav-prev', self.menucombo.element).addClass("cg-state-disabled")
			};
			if (self.page == total) {
				$('.' + self.element.attr('id') + '.cg-keynav-next', self.menucombo.element).addClass("cg-state-disabled");
				$('.' + self.element.attr('id') + '.cg-keynav-last', self.menucombo.element).addClass("cg-state-disabled")
			};
			$('.' + self.element.attr('id') + '.cg-keynav-next', self.menucombo.element).bind('click.combogrid', function() {
				if (self.page < total) {
					self.page++;
					self._search(self.term)
				}
			});
			$('.' + self.element.attr('id') + '.cg-keynav-prev', self.menucombo.element).bind('click.combogrid', function() {
				if (self.page > 1) {
					self.page--;
					self._search(self.term)
				}
			});
			$('.' + self.element.attr('id') + '.cg-keynav-last', self.menucombo.element).bind('click.combogrid', function() {
				if (total > 1 && self.page < total) {
					self.page = total;
					self._search(self.term)
				}
			});
			$('.' + self.element.attr('id') + '.cg-keynav-first', self.menucombo.element).bind('click.combogrid', function() {
				if (total > 1 && self.page > 1) {
					self.page = 1;
					self._search(self.term)
				}
			});
			$('.' + self.element.attr('id') + '.currentPage', self.menucombo.element).keypress(function(e) {
				var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
				if (key == 13) {
					if (!isNaN($(this).val()) && $(this).val() != 0) {
						if ($(this).val() > total) {
							self.page = total
						} else {
							self.page = $(this).val()
						}
						self._search(self.term)
					}
				}
			});
			$('.' + self.element.attr('id') + '.pageRedirct', self.menucombo.element).click(function() {
				var pageNum = $('.' + self.element.attr('id') + '.currentPage', self.menucombo.element).val();
				if (!isNaN(pageNum) && pageNum != 0) {
					if (pageNum > total) {
						self.page = total
					} else {
						self.page = pageNum
					}
					self._search(self.term)
				}
			});
			$('.' + self.element.attr('id') + '.recordXP', self.menucombo.element).bind('change', function() {
				self.options.rows = this.value;
				self.page = 1;
				self._search(self.term)
			});
			return div
		},
		_renderPagerPage: function(label, page, total) {
			var self = this;
			if (this.options.i18n) {
				return $.i18n.prop('page') + ' <input type="text" size="1" class="' + self.element.attr('id') + ' currentPage" value="' + page + '"></input> ' + $.i18n.prop('of') + ' ' + total
			} else {
				return '<input type="text" size="1" class="' + self.element.attr('id') + ' currentPage" value="' + page + '"></input> /' + total
			}
		},
		_renderPagerView: function(label, initRecord, lastRecord, records) {
			if (this.options.i18n) {
				return $.i18n.prop(label, initRecord, lastRecord, records)
			} else {
				return "共" + records + "条记录"
			}
		},
		_move: function(direction, event) {
			if (!this.menucombo.element.is(":visible")) {
				this.search(null, event);
				return
			}
			if (this.menucombo.first() && /^previous/.test(direction) || this.menucombo.last() && /^next/.test(direction)) {
				this.element.val(this.term);
				this.menucombo.deactivate();
				return
			}
			this.menucombo[direction](event)
		},
		widget: function() {
			return this.menucombo.element
		}
	});
	$.extend($.cg.combogrid, {
		escapeRegex: function(value) {
			return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
		},
		filter: function(array, term) {
			var matcher = new RegExp($.cg.combogrid.escapeRegex(term), "i");
			return $.grep(array, function(value) {
				return matcher.test(value.label || value.value || value)
			})
		}
	})
}(jQuery));
(function($) {
	$.widget("cg.menucombo", {
		_create: function() {
			var self = this;
			this.element.addClass("cg-menu ui-widget ui-widget-content ui-corner-all combogrid").attr({
				role: "listbox",
				"aria-activedescendant": "ui-active-menuitem"
			}).click(function(event) {
				if (!$(event.target).closest(".cg-menu-item div").length) {
					return
				}
				event.preventDefault();
				self.select(event)
			});
			this.refresh()
		},
		refresh: function() {
			var self = this;
			var items = this.element.children("div:not(.cg-menu-item):not(#cg-divHeader):not(.cg-comboButton):has(div)").addClass("cg-menu-item").attr("role", "menuitem");
			items.children("div").addClass("ui-corner-all").attr("tabindex", -1).mouseenter(function(event) {
				self.activate(event, $(this).parent())
			}).mouseleave(function() {
				self.deactivate()
			})
		},
		activate: function(event, item) {
			this.deactivate();
			if (this.hasScroll()) {
				var offset = item.offset().top - this.element.offset().top,
					scroll = this.element.attr("scrollTop"),
					elementHeight = this.element.height();
				if (offset < 0) {
					this.element.attr("scrollTop", scroll + offset)
				} else if (offset >= elementHeight) {
					this.element.attr("scrollTop", scroll + offset - elementHeight + item.height())
				}
			}
			this.active = item.eq(0).addClass("ui-state-hover").attr("id", "ui-active-menuitem").end();
			this._trigger("focus", event, {
				item: item
			})
		},
		deactivate: function() {
			if (!this.active) {
				return
			}
			this.active.removeClass("ui-state-hover").removeAttr("id");
			this._trigger("blur");
			this.active = null
		},
		next: function(event) {
			this.move("next", ".cg-menu-item:first", event)
		},
		previous: function(event) {
			this.move("prev", ".cg-menu-item:last", event)
		},
		first: function() {
			return this.active && !this.active.prevAll(".cg-menu-item").length
		},
		last: function() {
			return this.active && !this.active.nextAll(".cg-menu-item").length
		},
		move: function(direction, edge, event) {
			if (!this.active) {
				this.activate(event, this.element.children(edge));
				return
			}
			var next = this.active[direction + "All"](".cg-menu-item").eq(0);
			if (next.length) {
				this.activate(event, next)
			} else {
				this.activate(event, this.element.children(edge))
			}
		},
		nextPage: function(event) {
			if (this.hasScroll()) {
				if (!this.active || this.last()) {
					this.activate(event, this.element.children(".cg-menu-item:first"));
					return
				}
				var base = this.active.offset().top,
					height = this.element.height(),
					result = this.element.children(".cg-menu-item").filter(function() {
						var close = $(this).offset().top - base - height + $(this).height();
						return close < 10 && close > -10
					});
				if (!result.length) {
					result = this.element.children(".cg-menu-item:last")
				}
				this.activate(event, result)
			} else {
				this.activate(event, this.element.children(".cg-menu-item").filter(!this.active || this.last() ? ":first" : ":last"))
			}
		},
		previousPage: function(event) {
			if (this.hasScroll()) {
				if (!this.active || this.first()) {
					this.activate(event, this.element.children(".cg-menu-item:last"));
					return
				}
				var base = this.active.offset().top,
					height = this.element.height();
				result = this.element.children(".cg-menu-item").filter(function() {
					var close = $(this).offset().top - base + height - $(this).height();
					return close < 10 && close > -10
				});
				if (!result.length) {
					result = this.element.children(".cg-menu-item:first")
				}
				this.activate(event, result)
			} else {
				this.activate(event, this.element.children(".cg-menu-item").filter(!this.active || this.first() ? ":last" : ":first"))
			}
		},
		hasScroll: function() {
			return this.element.height() < this.element.attr("scrollHeight")
		},
		select: function(event) {
			this._trigger("selected", event, {
				item: this.active
			})
		}
	});
	$.fn.extend({
		jsonExtend: function(des, src, override) {
			if (src instanceof Array) {
				for (var i = 0, len = src.length; i < len; i++) $(this).extend(des, src[i], override)
			}
			for (var i in src) {
				if (override || !(i in des)) {
					des[i] = src[i]
				}
			}
			return des
		}
	})
}(jQuery));

(function($) {
	var D = $(document).data("func", {});
	$.smartMenu = $.noop;
	$.fn.smartMenu = function(data, options) {
		var B = $("body"),
			defaults = {
				name: "",
				offsetX: 2,
				offsetY: 2,
				textLimit: 6,
				beforeShow: $.noop,
				afterShow: $.noop
			};
		var params = $.extend(defaults, options || {});
		var htmlCreateMenu = function(datum) {
				var dataMenu = datum || data,
					nameMenu = datum ? Math.random().toString() : params.name,
					htmlMenu = "",
					htmlCorner = "",
					clKey = "smart_menu_";
				if ($.isArray(dataMenu) && dataMenu.length) {
					htmlMenu = '<div id="smartMenu_' + nameMenu + '" class="' + clKey + 'box">' + '<div class="' + clKey + 'body">' + '<ul class="' + clKey + 'ul">';
					var hideSeparate;
					$.each(dataMenu, function(i, arr) {
						if (i && !hideSeparate) {
							htmlMenu = htmlMenu + '<li class="' + clKey + 'li_separate">&nbsp;</li>'
						}
						hideSeparate = true;
						if ($.isArray(arr)) {
							$.each(arr, function(j, obj) {
								if (obj.hide) {
									return
								}
								hideSeparate = false;
								var text = obj.text,
									htmlMenuLi = "",
									strTitle = "",
									rand = Math.random().toString().replace(".", "");
								if (text) {
									if (text.length > params.textLimit) {
										text = text.slice(0, params.textLimit) + "…";
										strTitle = ' title="' + obj.text + '"'
									}
									if ($.isArray(obj.data) && obj.data.length) {
										htmlMenuLi = '<li class="' + clKey + 'li' + (obj.disabled ? ' ' + clKey + 'li_disabled' : '') + '" data-hover="true">' + htmlCreateMenu(obj.data) + '<a href="javascript:" class="' + clKey + 'a' + (obj.disabled ? ' ' + clKey + 'a_disabled' : '') + '"' + strTitle + ' data-key="' + rand + '"><i class="' + clKey + 'triangle"></i>' + text + '</a>' + '</li>'
									} else {
										htmlMenuLi = '<li class="' + clKey + 'li' + (obj.disabled ? ' ' + clKey + 'li_disabled' : '') + '">' + '<a href="javascript:" class="' + clKey + 'a' + (obj.disabled ? ' ' + clKey + 'a_disabled' : '') + '"' + strTitle + ' data-key="' + rand + '">' + text + '</a>' + '</li>'
									}
									htmlMenu += htmlMenuLi;
									var objFunc = D.data("func");
									objFunc[rand] = obj.func;
									D.data("func", objFunc)
								}
							})
						}
					});
					htmlMenu = htmlMenu + '</ul>' + '</div>' + '</div>'
				}
				return htmlMenu
			},
			funSmartMenu = function() {
				var idKey = "#smartMenu_",
					clKey = "smart_menu_",
					jqueryMenu = $(idKey + params.name);
				if (!jqueryMenu.size()) {
					$("body").append(htmlCreateMenu());
					$(idKey + params.name + " a").bind("click", function() {
						if (!$(this).is("." + clKey + "a_disabled") && !$(this).parent().attr("data-hover")) {
							var key = $(this).attr("data-key"),
								callback = D.data("func")[key];
							if ($.isFunction(callback)) {
								callback.call(D.data("trigger"))
							}
							$.smartMenu.hide()
						}
						return false
					});
					$(idKey + params.name + " li").each(function() {
						var isHover = $(this).attr("data-hover"),
							clHover = clKey + "li_hover";
						$(this).hover(function() {
							var jqueryHover = $(this).siblings("." + clHover);
							jqueryHover.removeClass(clHover).children("." + clKey + "box").hide();
							jqueryHover.children("." + clKey + "a").removeClass(clKey + "a_hover");
							if (!$(this).is("." + clKey + "li_disabled") && isHover) {
								$.smartMenu.fixPosition($(this).addClass(clHover).children("." + clKey + "box").show());
								$(this).children("." + clKey + "a").addClass(clKey + "a_hover")
							}
						}, $.noop)
					});
					return $(idKey + params.name)
				}
				return jqueryMenu
			};
		$(this).each(function() {
			this.oncontextmenu = function(e) {
				if ($.isFunction(params.beforeShow)) {
					params.beforeShow.call(this)
				}
				e = e || window.event;
				e.cancelBubble = true;
				if (e.stopPropagation) {
					e.stopPropagation()
				}
				$.smartMenu.hide();
				var st = D.scrollTop();
				var jqueryMenu = funSmartMenu();
				if (jqueryMenu) {
					jqueryMenu.css({
						display: "block",
						left: e.clientX + params.offsetX,
						top: e.clientY + st + params.offsetY
					});
					$.smartMenu.fixPosition(jqueryMenu);
					D.data("target", jqueryMenu);
					D.data("trigger", this);
					if ($.isFunction(params.afterShow)) {
						params.afterShow.call(this)
					}
					return false
				}
			}
		});
		if (!B.data("bind")) {
			B.bind("click", $.smartMenu.hide).data("bind", true)
		}
	};
	$.extend($.smartMenu, {
		hide: function() {
			var target = D.data("target");
			if (target && target.css("display") === "block") {
				target.find("div.smart_menu_box").hide().css({
					"left": "130px",
					"top": "-1px"
				});
				target.find("a.smart_menu_a_hover").removeClass("smart_menu_a_hover");
				target.hide()
			}
		},
		remove: function() {
			var target = D.data("target");
			if (target) {
				target.remove()
			}
		},
		fixPosition: function(box) {
			var B = $(window);
			var subMenu = box.parent().is("li.smart_menu_li");
			var p = box.offset();
			if (p.left + box.width() > B.width()) {
				box.css("left", subMenu ? "-130px" : p.left - box.width())
			}
			var top = $(document).scrollTop() + B.height() - box.height();
			if (p.top > top) {
				box.css("top", subMenu ? $(document).scrollTop() + B.height() - p.top - box.height() - 2 : top)
			}
		}
	})
})(jQuery);



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

(function($, l) {
	$.fn.extend({
		susdDatepickerInit: function(a, b) {
			var c = $(this);
			if (!c.data("initSusdDatepicker")) {
				c.susdDatepicker({
					dateFormat: a,
					autoOpen: true,
					defaultDate: b
				})
			}
		}
	});
	var m = new function() {
			this.today = new Date();
			this.selectedDay = new Date(this.today);
			this.currDay = new Date(this.selectedDay);
			this.widget = null;
			this.head;
			this.calendar;
			this.yearSelect;
			this.monthSelect;
			this.timeBar;
			this.hourSelect;
			this.minuteSelect;
			this.secondSelect;
			this.dp;
			this.okButton;
			this.init = function() {
				var b = this;
				if (b.widget == null) {
					b.widget = $("<div style='display:none;position:absolute;z-index:1001;' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>").appendTo(document.body);
					b.widget.bgiframe();
					b.head = $("<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all'></div>").appendTo(b.widget);
					$("<a class='ui-datepicker-prev ui-corner-all' title='上月'><span class='ui-icon ui-icon-circle-triangle-w'>上月</span></a>").hover(function() {
						$(this).addClass("ui-state-hover ui-datepicker-prev-hover")
					}, function() {
						$(this).removeClass("ui-state-hover ui-datepicker-prev-hover")
					}).click(function() {
						b.selectedDay.setMonth(b.selectedDay.getMonth() - 1);
						b.showCalendar()
					}).appendTo(b.head);
					$("<a class='ui-datepicker-next ui-corner-all' title='下月'><span class='ui-icon ui-icon-circle-triangle-e'>下月</span></a>").hover(function() {
						$(this).addClass("ui-state-hover ui-datepicker-prev-next")
					}, function() {
						$(this).removeClass("ui-state-hover ui-datepicker-prev-next")
					}).click(function() {
						b.selectedDay.setMonth(b.selectedDay.getMonth() + 1);
						b.showCalendar()
					}).appendTo(b.head);
					var c = $("<div class='ui-datepicker-title'></div>").appendTo(b.head);
					b.yearSelect = $("<select class='ui-datepicker-year'></select>").change(function() {
						b.selectedDay.setFullYear(this.value);
						b.showCalendar()
					}).appendTo(c);
					for (var i = b.today.getFullYear() + 10; i > 1900; i--) {
						b.yearSelect.append("<option value='" + i + "'>" + i + "</option>")
					}
					c.append("年&nbsp;");
					b.monthSelect = $("<select class='ui-datepicker-month'></select>").change(function() {
						b.selectedDay.setMonth(this.value);
						b.showCalendar()
					}).appendTo(c);
					for (var i = 0; i < 12; i++) {
						b.monthSelect.append("<option value='" + i + "'>" + (i + 1) + "</option>")
					}
					c.append("月");
					var d = $("<table class='ui-datepicker-calendar'><thead><tr><th><span title='星期一'>一</span></th><th><span title='星期二'>二</span></th><th><span title='星期三'>三</span></th><th><span title='星期四'>四</span></th><th><span title='星期五'>五</span></th><th class='ui-datepicker-week-end'><span title='星期六'>六</span></th><th class='ui-datepicker-week-end'><span title='星期日'>日</span></th></tr></thead></table>").appendTo(b.widget);
					b.calendar = $("<tbody></tbody>").appendTo(d);
					for (var i = 0; i < 6; i++) {
						var e = $("<tr></tr>").appendTo(b.calendar);
						for (var j = 0; j < 7; j++) {
							$("<td></td>").hover(function() {
								$(this).children("a").addClass("ui-state-hover")
							}, function() {
								$(this).children("a").removeClass("ui-state-hover")
							}).click(function(a) {
								if ($(this).is(".ui-datepicker-other-month")) {
									return
								}
								m.selectedDay.setDate($(this).text() - 0);
								m.selectedDay.setHours(b.hourSelect.val());
								m.selectedDay.setMinutes(b.minuteSelect.val());
								m.selectedDay.setSeconds(b.secondSelect.val());
								m.dp.select.call(m.dp, a, m.selectedDay)
							}).appendTo(e)
						}
					}
					b.timeBar = $("<div style='text-align:center;'></div>").appendTo(b.widget);
					b.hourSelect = $("<select></select>").appendTo(b.timeBar);
					for (var i = 0; i < 24; i++) {
						b.hourSelect.append("<option value='" + i + "'>" + i + "</option>")
					}
					b.timeBar.append("时&nbsp;");
					b.minuteSelect = $("<select></select>").appendTo(b.timeBar);
					for (var i = 0; i < 60; i++) {
						b.minuteSelect.append("<option value='" + i + "'>" + i + "</option>")
					}
					b.timeBar.append("分&nbsp;");
					b.secondSelect = $("<select></select>").appendTo(b.timeBar);
					for (var i = 0; i < 60; i++) {
						b.secondSelect.append("<option value='" + i + "'>" + i + "</option>")
					}
					b.timeBar.append("秒");
					var f = $("<div class='ui-datepicker-buttonpane ui-widget-content'></div>").appendTo(b.widget);
					$("<button class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all'>今天</button>").hover(function() {
						$(this).addClass("ui-state-hover")
					}, function() {
						$(this).removeClass("ui-state-hover")
					}).click(function(a) {
						b.currDay = new Date(b.today);
						b.currDay.setHours(b.hourSelect.val());
						b.currDay.setMinutes(b.minuteSelect.val());
						b.currDay.setSeconds(b.secondSelect.val());
						b.dp.select(a, b.currDay)
					}).appendTo(f);
					b.okButton = $("<button class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all'>确定</button>").hover(function() {
						$(this).addClass("ui-state-hover")
					}, function() {
						$(this).removeClass("ui-state-hover")
					}).click(function(a) {
						b.currDay.setHours(b.hourSelect.val());
						b.currDay.setMinutes(b.minuteSelect.val());
						b.currDay.setSeconds(b.secondSelect.val());
						b.dp.select(a, b.currDay)
					}).appendTo(f)
				}
			};
			this.showCalendar = function() {
				var a = this;
				var b = a.selectedDay.getFullYear();
				var c = a.selectedDay.getMonth();
				var e = a.selectedDay.getHours();
				var f = a.selectedDay.getMinutes();
				var g = a.selectedDay.getSeconds();
				a.yearSelect.val(b);
				a.monthSelect.val(c);
				a.hourSelect.val(e);
				a.minuteSelect.val(f);
				a.secondSelect.val(g);
				var d = new Date(a.selectedDay);
				d.setDate(1);
				var h = d.getDay();
				if (h == 0) {
					h = 7
				}
				d.setMonth(c + 1);
				d.setDate(0);
				var j = d.getDate();
				var k = a.calendar.find("td").removeClass().each(function(i) {
					if (i + 1 < h || i > j + h - 2) {
						$(this).html("&nbsp;").addClass("ui-datepicker-other-month ui-datepicker-unselectable ui-state-disabled")
					} else {
						$(this).html("<a class='ui-state-default' href='javascript:$.noop()'>" + (i + 2 - h) + "</a>")
					}
				});
				if (k.eq(35).is(".ui-datepicker-other-month")) {
					a.calendar.children("tr:last").hide()
				} else {
					a.calendar.children("tr:last").show()
				}
				if (a.today.getFullYear() == b && a.today.getMonth() == c) {
					k.eq(a.today.getDate() + h - 2).addClass("ui-datepicker-days-cell-over  ui-datepicker-current-day ui-datepicker-today").children("a").addClass("ui-state-highlight ui-state-active")
				}
				if (a.currDay.getFullYear() == b && a.currDay.getMonth() == c) {
					k.eq(a.currDay.getDate() + h - 2).addClass("ui-datepicker-current-day").children("a").addClass("ui-state-active")
				}
			};
			this.format = function(b, c) {
				function _02(a) {
					a -= 0;
					if (isNaN(a)) {
						return a
					} else if (a < 10) {
						return "0" + a
					} else {
						return "" + a
					}
				}
				b = b || "yyyy-mm-dd";
				c = c || new Date();
				b = b.replace(/yyyy/g, c.getFullYear());
				b = b.replace(/mm/g, _02(c.getMonth() + 1));
				b = b.replace(/dd/g, _02(c.getDate()));
				b = b.replace(/hh/g, _02(c.getHours()));
				b = b.replace(/mi/g, _02(c.getMinutes()));
				b = b.replace(/ss/g, _02(c.getSeconds()));
				return b
			};
			this.parse = function(c, d) {
				function getNum(a) {
					var i = c.indexOf(a);
					if (i > -1) {
						var b = d.substring(i, i + a.length) - 0;
						return b
					}
					return 0
				}
				if (c && d && c.length == d.length) {
					var e = new Date();
					e.setFullYear(getNum("yyyy"));
					e.setMonth(getNum("mm") - 1);
					e.setDate(getNum("dd"));
					e.setHours(getNum("hh"));
					e.setMinutes(getNum("mi"));
					e.setSeconds(getNum("ss"));
					if (!isNaN(e.getFullYear())) {
						return e
					}
				}
				return new Date()
			};
			this.setSelectedDay = function(a, b) {
				if (b && b.getFullYear) {
					this.selectedDay = b
				} else {
					this.selectedDay = this.parse(a, b)
				}
				this.currDay = new Date(this.selectedDay);
				this.selectedDay.setDate(1)
			}
		};
	$.widget("susd.susdDatepicker", {
		options: {
			dateFormat: 'yyyy-mm-dd',
			autoOpen: false,
			defaultDate: null
		},
		_create: function() {
			var b = this;
			b.element.data("initSusdDatepicker", true).bind("keyup.susdDatepicker", function(a) {
				if (a.keyCode == 9) {
					b.open(a)
				}
			}).bind("keydown.susdDatepicker", function(a) {
				if (a.keyCode == 9) {
					b.close()
				}
			}).bind("click.susdDatepicker", function(a) {
				b.open(a)
			}).next().bind("click.susdDatepicker", function(a) {
				b.open(a)
			});
			if (b.options.autoOpen) {
				b.open()
			}
		},
		open: function(c) {
			var d = this;
			if (d.element.is(":disabled") || d.element.attr("readonly")) {
				return
			}
			d.element.focus();
			m.dp = d;
			if (d.element.val()) {
				m.setSelectedDay(d.options.dateFormat, d.element.val())
			} else {
				m.setSelectedDay(d.options.dateFormat, d.options.defaultDate)
			}
			m.init();
			if (m.widget.is(":visible")) {
				return
			}
			if (d.options.dateFormat.indexOf('hh') > -1) {
				m.timeBar.show()
			} else {
				m.timeBar.hide()
			}
			m.showCalendar();
			$(document).bind("mousedown.susdDatepicker", function(a) {
				var b = a.target;
				if (b == d.element[0] || $(b).parents("div.ui-datepicker").size() > 0) {
					return
				}
				d.close(a)
			}).bind("keypress.susdDatepicker", function() {
				m.okButton.click()
			});
			var e = d.element.offset();
			m.widget.show();
			m.widget.css({
				top: Math.min(e.top + d.element.outerHeight() + 2, $(document).scrollTop() + $(window).height() - m.widget.outerHeight() - 2),
				left: Math.min(e.left - 5, $(window).width() - m.widget.outerWidth() - 20)
			});
			d._trigger('open', c)
		},
		select: function(a, b) {
			var c = this;
			var d = m.format(c.options.dateFormat, b);
			if (c.element.val() != d) {
				c.element.val(d);
				c._trigger('change', a, b);
				c.element.change()
			}
			c._trigger('select', a, b);
			c.element.susdValidate("validate");
			c.element.focus();
			c.close(a)
		},
		close: function(a) {
			var b = this;
			m.widget.hide();
			$(document).unbind("mousedown.susdDatepicker keypress.susdDatepicker");
			b._trigger('close', a)
		},
		destroy: function() {
			this.element.data("initSusdDatepicker", false).unbind("keyup.susdDatepicker").unbind("keydown.susdDatepicker").unbind("click.susdDatepicker").next().bind("click.susdDatepicker");
			$(document).unbind("mousedown.susdDatepicker keypress.susdDatepicker");
			$.Widget.prototype.destroy.call(this)
		}
	})
}(jQuery));

(function($, q) {
	$.widget("susd.susdValidate", {
		_parent: null,
		options: {
			auto: false,
			validate: function() {
				return false
			}
		},
		_create: function() {
			var a = this;
			var c = a.element;
			if (c.is("form")) {
				c.susdSubmit(function() {
					var b = a.validate();
					return !b
				})
			} else {} if (a.options.auto) {
				return a.validate(true)
			}
		},
		_v: function(a) {
			var b = this;
			var c = b.element;
			var d = c.attr("validate");
			if (!d) {
				return false
			}
			var m = c.attr("vmsg");
			m = m == null ? "" : m;
			var e = false;
			if (/^(\*?)(d|td|e|n|s|c)?(\d*)-?(\d*)\s*(\d*),?([^~]*)~?(.*)$/.exec(d)) {
				var f = RegExp.$1 == "*";
				var g = RegExp.$2;
				var h = RegExp.$3;
				var i = RegExp.$4;
				var j = RegExp.$5;
				var k = RegExp.$6;
				var l = RegExp.$7;
				if (c.is("select")) {
					e = b._vSelect(m, f, g, h, i, j, k, l)
				} else if (c.is(".checkboxContainer")) {
					e = b._vCheckbox(m, f, h, i)
				} else if (c.is(".radioContainer")) {
					e = b._vRadio(m, f)
				} else if (c.is("input[type=file]")) {
					e = b._vFile(m, f)
				} else {
					e = b._vInput(m, f, g, h, i, j, k, l)
				}
				if (!e && $.isFunction(b.options.validate)) {
					e = b.options.validate.call(c)
				}
				if (e) {
					var n = b._getErrorInfoBox(e);
					b._parent.addClass("erroBox fn-clear").unbind("mouseover.susdValidate").bind("mouseover.susdValidate", function() {
						$(this).addClass("zindexuperro");
						b._getErrorInfoBox(e).show()
					}).unbind("mouseout.susdValidate").bind("mouseout.susdValidate", function() {
						$(this).removeClass("zindexuperro");
						b._getErrorInfoBox().hide()
					}).unbind("click.susdValidate").bind("click.susdValidate", function() {
						c.susdValidate("validate")
					}).unbind("keyup.susdValidate").bind("keyup.susdValidate", function() {
						c.susdValidate("validate")
					});
					if (a) {
						b._parent.removeClass("zindexuperro");
						n.hide()
					} else {
						b._parent.addClass("zindexuperro");
						n.show()
					}
				} else {
					if (!a) {
						b._getErrorInfoBox().hide()
					}
					b._parent.removeClass("erroBox fn-clear zindexuperro").unbind("mouseover.susdValidate")
				}
			} else {
				$(document.body).html("<textarea style='width:100%;height:500px;font-size:50px;'>error:\n" + $("<div></div>").append(c).html() + "</textarea>");
				throw Error;
			}
			return e
		},
		_vFile: function(m, a) {
			var b = this;
			b._parent = b.element.parent().parent();
			var c = false;
			var d = b._parent.find("input[name=" + b.element.attr("id") + "Path]").val();
			var e = d.length;
			if (a && e == 0) {
				c = b._format(b._msg.requiredSelect, m)
			}
			return c
		},
		_vInputSelect: function(m, a, b, c, d, e, f, g) {
			var h = this;
			var i = h.element;
			var j = false;
			var k = i.val();
			var l = k.length;
			if (a && l == 0) {
				j = h._format(h._msg.required, m)
			}
			if (!j) {
				var n = {
					"d": /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/,
					"td": /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29) \d{1,2}:\d{1,2}:\d{1,2}$/,
					"e": /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[ -퟿豈-﷏ﷰ-￯])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[ -퟿豈-﷏ﷰ-￯])+)*)|((")(((( |	)*(
))?( |	)+)?(([--]|!|[#-[]|[]-~]|[ -퟿豈-﷏ﷰ-￯])|(\\([-	
-]|[ -퟿豈-﷏ﷰ-￯]))))*((( |	)*(
))?( |	)+)?(")))@((([a-z]|\d|[ -퟿豈-﷏ﷰ-￯])|(([a-z]|\d|[ -퟿豈-﷏ﷰ-￯])([a-z]|\d|-|\.|_|~|[ -퟿豈-﷏ﷰ-￯])*([a-z]|\d|[ -퟿豈-﷏ﷰ-￯])))\.)+(([a-z]|[ -퟿豈-﷏ﷰ-￯])|(([a-z]|[ -퟿豈-﷏ﷰ-￯])([a-z]|\d|-|\.|_|~|[ -퟿豈-﷏ﷰ-￯])*([a-z]|[ -퟿豈-﷏ﷰ-￯])))$/i,
					"n": /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,
					"s": /^(\n|.)*$/,
					"c": /^[^Α-￥]*$/
				};
				var p = n[b];
				if (!p) {
					p = n["s"]
				}
				if (l > 0 && p.exec(k) == null) {
					j = h._format(h._msg.format[b], m)
				}
			}
			if (!j && b == "n") {
				l = k.replace(/(-|,|\.\d*)/g, "").length;
				var o = k.replace(/^-?[\d,]+\.?/, "").length;
				if (o > e) {
					if (e == 0) {
						j = h._format(h._msg.integer, m)
					} else {
						j = h._format(h._msg.decimalLength, e, m)
					}
				}
			} else if (!j && b == "s") {
				l = k.replace(/\n/g, "##").length
			}
			if (!j && l && c && c > l) {
				j = h._format(h._msg.minlength, c, m)
			}
			if (!j && d && d < l) {
				j = h._format(h._msg.maxlength, d, m)
			}
			if (l > 0) {
				if (b == "n") {
					if (!j && f && f - k > 0) {
						j = h._format(h._msg.minValue, f, "数字")
					}
					if (!j && g && g - k < 0) {
						j = h._format(h._msg.maxValue, g, "数字")
					}
				} else {
					if (!j && f && f > k) {
						j = h._format(h._msg.minValue, f, {
							d: "日期",
							td: "时间",
							e: "邮件",
							n: "数字",
							s: "值"
						}[b])
					}
					if (!j && g && g < k) {
						j = h._format(h._msg.maxValue, g, {
							d: "日期",
							td: "时间",
							e: "邮件",
							n: "数字",
							s: "值"
						}[b])
					}
				}
			}
			return j
		},
		_vInput: function(m, a, b, c, d, e, f, g) {
			var h = this;
			var i = h.element;
			h._parent = i.parent().parent();
			return h._vInputSelect(m, a, b, c, d, e, f, g)
		},
		_vSelect: function(m, a, b, c, d, e, f, g) {
			var h = this;
			var i = h.element;
			h._parent = i.parent().parent();
			if (h._parent.is(".inputCoverCnt")) {
				h._parent = h._parent.parent()
			}
			var j = false;
			var k = i.val().length;
			if (a && k == 0) {
				j = h._format(h._msg.requiredSelect, m)
			}
			if (!j && c && c > k) {
				j = h._format(h._msg.minlength, c, m)
			}
			if (!j && d && d < k) {
				j = h._format(h._msg.maxlength, d, m)
			}
			if (!j && h._parent.is(".inputCover")) {
				j = h._vInputSelect(m, a, b, c, d, e, f, g)
			}
			return j
		},
		_vRadio: function(m, a) {
			var b = this;
			var c = b.element;
			b._parent = c;
			var d = false;
			var e = c.children("input:checked").size();
			if (a && e == 0) {
				d = b._format(b._msg.requiredSelect, m)
			}
			return d
		},
		_vCheckbox: function(m, a, b, c) {
			var d = this;
			var e = d.element;
			d._parent = e;
			var f = false;
			var g = e.children("input:checked").size();
			if (a && g == 0) {
				f = d._format(d._msg.requiredSelect, m)
			}
			if (!f && b && b > g) {
				f = d._format(d._msg.minlengthSelect, b, m)
			}
			if (!f && c && c < g) {
				f = d._format(d._msg.maxlengthSelect, c, m)
			}
			return f
		},
		_getErrorInfoBox: function(a) {
			var b = this;
			var c = b.element;
			var d = c.data("errorInfoBox");
			if (!d) {
				d = $("<div class='erroInfoBox'></div>");
				b._parent.append(d);
				c.data("errorInfoBox", d)
			}
			if (a) {
				d.html("<span class='erroInfoBoxArrow'/><span class='erroAttentionIcon'/>" + a);
				var e;
				if (b._parent.offset().left > 27) {
					e = Math.max(0, b._parent.offset().left + d.outerWidth() - $(window).width() + 20)
				} else {
					e = b._parent.offset().left - 27
				}
				d.css({
					"top": b._parent.outerHeight() + 5,
					left: -10 - e
				}).children("span.erroInfoBoxArrow").css({
					left: 12 + e
				})
			}
			return d.bgiframe()
		},
		_msg: {
			decimalLength: "请输入小数位少于 {0} 位的 {1}",
			format: {
				d: "请输入符合格式 YYYY-MM-DD的日期",
				td: "请输入符合格式 YYYY-MM-DD HH:MI:SS的时间",
				e: "请输入合法的e-Mail",
				n: "请输入合法的数字",
				s: "请输入合法的字符串",
				c: "不允许输入中文和全角符号"
			},
			integer: "{0} 应为整数",
			maxlengthSelect: "请选择 {0} 个以下 {1}",
			minlengthSelect: "请选择 {0} 个以上 {1}",
			maxlength: "请输入长度在 {0} 以下的{1}",
			minlength: "请输入长度在 {0} 以上的{1}",
			maxValue: "请输入小于等于 {0} 的{1}",
			minValue: "请输入大于等于 {0} 的{1}",
			required: "请输入 {0}",
			requiredSelect: "请选择 {0}"
		},
		_format: function(a, b) {
			if (arguments.length == 1) return a;
			if (arguments.length > 2 && b.constructor != Array) {
				b = $.makeArray(arguments).slice(1)
			}
			if (b.constructor != Array) {
				b = [b]
			}
			$.each(b, function(i, n) {
				a = a.replace(new RegExp("\\{" + i + "\\}", "g"), n)
			});
			return a
		},
		validate: function(c) {
			var d = this;
			var e = d.element;
			if (!e.is("[validate]")) {
				var f = false;
				var g = [];
				e.find("[validate]").each(function() {
					var a = $(this);
					a.susdValidate();
					var b = a.susdValidate("validate", true);
					if (b) {
						g.push(b);
						if (!f) {
							f = a
						}
					}
				});
				if (f) {
					f.focus();
					return g
				} else {
					return null
				}
			} else {
				return d._v(c)
			}
		}
	})
}(jQuery));


(function($, k) {
	var l = "CombogridRowData";
	var m = "left";
	var n = "right";
	var o = "up";
	var q = "down";
	var r, _th, _tb, _tf;
	var s = 0,
		_cols = 0;
	var t;
	var u = false;
	var v = null;

	function init() {
		if (!u) {
			r = $("<div class='cg-autocomplete ui-widget ui-widget-content ui-corner-all cbg-div'></div>").bgiframe().appendTo(document.body);
			_th = $("<tr class='ui-state-default'></tr>");
			_tb = $("<tbody></tbody>");
			_tf = $("<td colspan='" + _cols + "' style='height:20x; '></td>");
			var d = $("<table class='cbg-table'></table>").appendTo(r);
			$("<thead></thead>").append(_th).appendTo(d);
			$("<tfoot><tr class='ui-state-default'></tr></tfoot>").appendTo(d).children().append(_tf);
			d.append(_tb);
			r.hover(function() {
				v._onBox = true
			}, function() {
				v._onBox = false;
				v.element.focus()
			});
			_th.click(function() {
				return false
			});
			_tf.click(function() {
				return false
			});
			$("<a class='cbg-paging-prev'><span class='ui-icon ui-icon-seek-prev'></span></a>").hover(function() {
				if ($(this).next().attr("curr") - 1 > 0) {
					$(this).addClass("ui-state-hover")
				}
			}, function() {
				$(this).removeClass("ui-state-hover")
			}).click(function(a) {
				var b = $(this).next().attr("curr");
				if (b - 1 > 0) {
					v.search(a, b - 1)
				}
				v.element.focus()
			}).appendTo(_tf);
			$("<span class='cbg-paging'>&nbsp;</span>").appendTo(_tf);
			$("<a class='cbg-paging-next'><span class='ui-icon ui-icon-seek-next'></span></a>").hover(function() {
				var a = $(this).prev().attr("curr");
				var b = $(this).prev().attr("total");
				if (a - b < 0) {
					$(this).addClass("ui-state-hover")
				}
			}, function() {
				$(this).removeClass("ui-state-hover")
			}).click(function(a) {
				var b = $(this).prev().attr("curr");
				var c = $(this).prev().attr("total");
				if (b - c < 0) {
					v.search(a, ++b)
				}
				v.element.focus()
			}).appendTo(_tf);
			setRows(10);
			setCols(3);
			u = true
		}
	}
	function setRows(b) {
		if (b != s) {
			_tb.children("tr:hidden").show();
			if (b > s) {
				for (var i = s; i < b; i++) {
					var c = $("<tr></tr>").appendTo(_tb);
					for (var j = 0; j < _cols; j++) {
						$("<td nowrap></td>").appendTo(c)
					}
					c.hover(function() {
						_tb.children().removeClass("ui-state-hover");
						if ($(this).data(l) != null) {
							$(this).addClass("ui-state-hover")
						}
					}, function() {
						$(this).removeClass("ui-state-hover")
					}).click(function(a) {
						if ($(this).data(l) != null) {
							v.select(a, $(this));
							v.element.focus();
							v.close(a)
						}
						return false
					})
				}
				s = b
			} else {
				_tb.children("tr:gt(" + (b - 1) + ")").hide()
			}
		}
	}
	function setCols(a) {
		if (_cols < a) {
			for (var i = _cols; i < a; i++) {
				_th.append("<td nowrap></td>");
				_tb.children().append("<td nowrap></td>");
				_tf.attr("colspan", a)
			}
			_cols = a
		}
	}
	$(function() {
		init()
	});
	$.fn.extend({
		susdCombogridInit: function(a, b) {
			var c = $(this);
			if (!c.data("susdCombogridInit")) {
				c.tempCombogrid($.extend({
					url: 'combogrid.ctrl?source=' + a
				}, b))
			}
		}
	});
	$.widget("susd.tempCombogrid", {
		_onBox: false,
		_isOpen: false,
		options: {
			_data: null,
			_selected: true,
			_timeoutSearch: null,
			_xhr: null,
			_term: null,
			exist: false,
			delay: 300,
			openOnfocus: true,
			openEvent: "click",
			positionX: n,
			positionY: q,
			match: function(a, b) {
				var c = {};
				if (b && b.length) {
					c = b[0]
				}
				return c
			}
		},
		_create: function() {
			var c = this;
			c.element.data("susdCombogridInit", true).bind(c.options.openEvent + ".susdCombogrid", function(a) {
				c.search(a)
			}).bind("keyup.susdCombogrid", function(a) {
				switch (a.keyCode) {
				case $.ui.keyCode.UP:
					var b = _tb.children("tr.ui-state-hover");
					if (b.size() == 1) {
						b.removeClass("ui-state-hover");
						b = b.prev("[hasData=1]")
					}
					if (b.size() == 0) {
						b = _tb.children("tr[hasData=1]:last")
					}
					b.addClass("ui-state-hover");
					break;
				case $.ui.keyCode.DOWN:
					var b = _tb.children("tr.ui-state-hover");
					if (b.size() == 1) {
						b.removeClass("ui-state-hover");
						b = b.next("[hasData=1]")
					}
					if (b.size() == 0) {
						b = _tb.children("tr[hasData=1]:first")
					}
					b.addClass("ui-state-hover");
					break;
				case $.ui.keyCode.ENTER:
					if (c.options._term != c.element.val()) {
						c.delaySearch(a)
					} else {
						var b = _tb.children("tr.ui-state-hover");
						if (b.size() == 1) {
							c.select(a, _tb.children("tr.ui-state-hover"));
							c.close(a)
						}
					}
					break;
				case $.ui.keyCode.TAB:
					if (c.options.openOnfocus) {
						c.search(a)
					}
					break;
				default:
					if (c.options._term != c.element.val()) {
						c.options._selected = false;
						c.delaySearch(a)
					}
				}
			}).bind("blur.susdCombogrid", function(a) {
				if (c.options._term != c.element.val()) {
					c.options._data = null;
					c.options._selected = false
				}
				if (c._onBox) {} else {
					c.close(a);
					c.options._data = null;
					c.options._term = null
				}
			})
		},
		open: function(a) {
			var b = this;
			var c = null;
			var d = b.element.offset();
			if (!b._isOpen) {
				b._isOpen = true;
				v = b;
				b.element.parent().parent().addClass("zindexup").prepend(r);
				b._trigger('open', a);
				var e = d.top - $(document).scrollTop() > r.outerHeight();
				var f = $(window).height() + $(document).scrollTop() - d.top - b.element.outerHeight() > r.outerHeight();
				if (e == f) {
					c = b.options.positionY
				} else if (e) {
					c = o
				} else {
					c = q
				}
				if (c == o) {
					r.css({
						top: "auto",
						bottom: b.element.outerHeight()
					})
				} else {
					r.css({
						top: b.element.outerHeight(),
						bottom: "auto"
					})
				}
				var g = d.left + b.element.outerWidth() > r.width();
				var h = $(window).width() - d.left > r.width();
				if (g == h) {
					c = b.options.positionX
				} else if (h) {
					c = n
				} else {
					c = m
				}
				if (c == n) {
					_tf.removeClass("cbg-paging-right");
					r.css({
						right: "auto",
						left: 0
					})
				} else {
					_tf.addClass("cbg-paging-right");
					r.css({
						right: 0,
						left: "auto"
					})
				}
				r.show()
			}
		},
		select: function(a, b) {
			var c = this;
			var d = null;
			if ($(b).is("tr")) {
				d = b.data(l)
			} else {
				d = b
			}
			if (!d) {
				d = {}
			}
			c._trigger('select', a, {
				item: d
			});
			c.element.susdValidate("validate");
			c.options._term = c.element.val();
			c.options._selected = true
		},
		close: function(c) {
			var d = this;
			clearTimeout(d.options._timeoutSearch);
			if (d.options._xhr) {
				d.options._xhr.abort()
			}
			if (d.options.exist && !d.options._selected) {
				if (d.element.val() == "") {
					d.select(c, {})
				} else {
					if (d.options._data) {
						var e = d.options.match.call(d.element[0], c, d.options._data.list);
						d.select(c, e)
					} else {
						d._getData(c, null, function(a) {
							var b = d.options.match.call(d.element[0], c, d.options._data.list);
							d.select(c, b)
						}, false)
					}
				}
			}
			if (d._isOpen) {
				d._isOpen = false;
				r.hide();
				d.element.parent().parent().removeClass("zindexup");
				d._trigger('close', c)
			}
		},
		delaySearch: function(a) {
			var b = this;
			b.options._data = null;
			_tb.children("tr.ui-state-hover").removeClass("ui-state-hover");
			clearTimeout(b.options._timeoutSearch);
			b.options._timeoutSearch = setTimeout(function() {
				b.search(a)
			}, b.options.delay)
		},
		search: function(g, h) {
			var i = this;
			i.options._data = null;
			_tb.children("tr.ui-state-hover").removeClass("ui-state-hover");
			i._getData(g, h, function(b) {
				_th.find("td").html("");
				_tb.find("td").html("");
				_tb.children().removeData(l).removeAttr("hasData");
				var c = i.options.colModel;
				setCols(c.length);
				var d = _th.children(":first");
				$(c).each(function() {
					d.html(this.label);
					d = d.next()
				});
				var e = null;
				if (i.options.exist) {
					e = i.options.match.call(i.element[0], g, b.list)
				}
				var f = _tb.children(":first");
				$(b.list).each(function() {
					var a = this;
					if (a == e) {
						f.addClass("ui-state-hover")
					}
					f.data(l, this).attr("hasData", 1);
					d = f.children(":first");
					$(c).each(function() {
						d.text(a[this.columnName]);
						d = d.next()
					});
					f = f.next()
				});
				_tf.children("span").attr({
					total: b.pageCount,
					curr: b.curPageNumber
				}).html(b.curPageNumber + " / " + b.pageCount);
				i.open(g)
			}, true)
		},
		_getData: function(b, c, d, e) {
			var f = this;
			f.options._term = f.element.val();
			if (f.options._xhr) {
				f.options._xhr.abort()
			}
			var p;
			if ($.isFunction(f.options.param)) {
				p = f.options.param.call(f.element)
			} else {
				p = f.options.param
			}
			f.options._xhr = $.ajax({
				url: f.options.url,
				async: e,
				data: $.extend({}, p, {
					searchTerm: f.options._term,
					page: c || 1,
					rows: 10
				}),
				dataType: "json",
				success: function(a) {
					f.options._xhr = null;
					f.options._data = a;
					d.call(f, a)
				},
				error: function() {
					f.options._xhr = null
				}
			})
		},
		destroy: function() {
			this.element.data("susdCombogridInit", false).unbind(self.options.openEvent + ".susdCombogrid keyup.susdCombogrid blur.susdCombogrid");
			clearTimeout(self.options._timeoutSearch);
			if (self.options._xhr) {
				self.options._xhr.abort()
			}
			$.Widget.prototype.destroy.call(this)
		}
	})
})(jQuery);