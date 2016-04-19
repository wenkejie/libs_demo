/**
 * @version 1.0.0
 * @author 魏长浩 2013-05-23
 * @depends jquery-1.9.1.js
 * @description 页面元素验证 需要添加页面级的滚动区域元素[.nui-scroll,.nui-scroll-x,.nui-scroll-y]，该元素带滚动属性且具有样式[position:relative]
 * 
 * @method  $obj.validate(); 返回验证错误消息，无错误时返回NULL； 可使用任意jQuery对象调用验证， 如果当前没有validate属性，则找该元素的子元素中包含validate属性的元素进行验证
 * 
 * @modify 徐显亮 中英文切换
 */
(function($) {	

$.extend($.fn, {

	defaults : {
		container : null,
		showfirstError : false,
		_parent : null,
		_errorInfoBox : null,
		debug : true,
		language:"cn"
	},
	validate : function(options,language) {
		//初始化容器
		$.fn.defaults.container = null;
		$.fn.defaults.showfirstError = false;
		if(language=="en"){
			$.fn.defaults.language = "en";
		}else{
			$.fn.defaults.language = "cn";
		}
		var self = this;
		// build main options before element iteration
		var opts = $.extend(self.defaults, options);
		if (opts.debug && window.console && window.console.log) {
			window.console.log("validate object:");
			window.console.log(self);
			window.console.log("validate selection count: " + self.size());
		}
		var element_size = self.size();
		var first = false;
		var msg = [];
		self.each(function(index,element){
			var $element = $(element);
			//判断当前元素是否有validate属性
			if($element.is("[validate]")){ 
				var _msg = $element._v(true);
				if(_msg){
					msg.push(_msg);
					if (!first) {
						first = $element;
					}
				}
			}else{//如果没有validate属性，则找该元素的子元素中包含validate属性的元素进行验证
				var _elements = $element.find("[validate]:visible");
				_elements.each(function(_index,_element){
					var _this = $(_element);
					var _str = _this._v(true);
					if (_str) {
						msg.push(_str);
						if (!first) {
							first = _this;
						}
					}
				});	
			}
		});
		if (first) {
			first.focus();
			//first.data("errorInfoBox").removeClass("none");
			if($.fn.defaults.showfirstError)
				first.mouseenter();
			return msg;
		}
		return null;
	},
	_format : function(source, params) {
		if (arguments.length == 1)
			return source;
		if (arguments.length > 2 && params.constructor != Array) {
			params = $.makeArray(arguments).slice(1);
		}
		if (params.constructor != Array) {
			params = [ params ];
		}
		$.each(params, function(i, n) {
			source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
		});
		return source;
	},
	_v : function(isHideInfo) {
		var self = this;
		
		var validateAttr = self.attr("validate");
		if (!validateAttr) {
			return false;
		}
		var m = self.attr("vmsg");
		m = m == null ? "" : m;
		if(m == ""){
			m = self.parents().find("label[for='"+self.attr("id")+"']").text();
		}
		m = m == null ? "" : m;
		if(m==""){
			m=self.attr("placeholder");
		}
		m = m == null ? "" : m;
		var msg = false;
		if (/^(\*?)(d|td|e|n|s|c)?(\d*)-?(\d*)\s*(\d*),?([^~]*)~?(.*)$/.exec(validateAttr)) {
			var required = RegExp.$1 == "*";
			var type = RegExp.$2;
			var min = RegExp.$3;
			var max = RegExp.$4;
			var decimal = RegExp.$5;
			var minValue = RegExp.$6;
			var maxValue = RegExp.$7;

			if (self.parent().is(".nui-select")) {
				msg = self._vSelect(m, required);
//			} else if (element.is(".checkboxContainer")) {
//				msg = self._vCheckbox(m, required, min, max);
//			} else if (element.is(".radioContainer")) {
//				/msg = self._vRadio(m, required);
			} else if (self.is("input[type=file]")) {
				msg = self._vFile(m, required);
			} else {
				msg = self._vInput(m, required, type, min, max, decimal, minValue, maxValue);
			}

//			if (!msg && $.isFunction(self.options.validate)) {
//				msg = self.options.validate.call(element);
//			}
			if (msg) {
				var box = self._getErrorInfoBox(msg);
				self._parent.addClass("nui-form-cell-error").unbind("mouseenter.susdValidate").bind("mouseenter.susdValidate", function() {
						self._getErrorInfoBox(msg).removeClass("none");
					}).unbind("mouseleave.susdValidate").bind("mouseleave.susdValidate", function() {
					self._getErrorInfoBox().addClass("none");
				}).unbind("click.susdValidate").bind("click.susdValidate", function() {
					return self._v(isHideInfo);
				}).unbind("keyup.susdValidate").bind("keyup.susdValidate", function() {
					return self._v(isHideInfo);
				});
				self.unbind("blur.susdValidate").bind("blur.susdValidate", function() {
					return self._v(isHideInfo);
				});
				if(self._parent.is(".nui-select")){
					self._parent.find("li").unbind("click.susdValidate").bind("click.susdValidate", function() {
						setTimeout(function(){return self._v(isHideInfo);},500);//先让下拉框控件赋值后再执行验证
					});
				}
				if (isHideInfo) {
					box.addClass("none");
				} else {
					box.removeClass("none");
				}
			} else {
				if (!isHideInfo) {
					self._getErrorInfoBox().addClass("none");
				}
				self._parent.removeClass("nui-form-cell-error").unbind("mouseenter.susdValidate");
			}
		} else {
			/* 验证格式串格式错误 */
			$(document.body).html(
					"<textarea style='width:100%;height:500px;font-size:50px;'>error:\n" + $("<div></div>").append(self).html()
							+ "</textarea>");
			throw Error;
		}
		return msg;
	},
	_vFile : function(m, required) {
		var self = this;
		self._parent = self.parents(".nui-form-cell");
		var msg = false;
		var val = self._parent.find("input[name=" + self.attr("id") + "Path]").val();
		var size = val.length;
		if (required && size == 0) {			
			if($.fn.defaults.language == "en"){
				msg = self._format(self._msg.requiredSelect_en, m);
			}else{
				msg = self._format(self._msg.requiredSelect, m);
			}		
		}
		return msg;
	},
	/**
	 * extVal 验证时优先使用该字段，不存在时使用 element.val();
	 */
	_vInputSelect : function(m, required, type, min, max, decimal, minValue, maxValue, extVal) {
		var self = this;
		var msg = false;
		var val = $.trim(extVal || self.val());
		var size = val ? val.length : 0;
		if (required && size == 0) {
			if($.fn.defaults.language == "en"){
				msg = self._format(self._msg.required_en, m);
			}else{
				msg = self._format(self._msg.required, m);
			}			
		}
		/* 格式验证 */
		if (!msg) {
			var pArr = {
				"d" : /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/,
				"td" : /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29) \d{1,2}:\d{1,2}:\d{1,2}$/,
				"e" : /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
				"n" : /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,
				"s" : /^(\n|.)*$/,
				"c" : /^[^\u0391-\uFFE5]*$/
			};
			var p = pArr[type];
			if (!p) {
				p = pArr["s"];
			}
			if (size > 0 && p.exec(val) == null) {
				if($.fn.defaults.language == "en"){
					msg = self._format(self._msg.format_en[type], m);
				}else{
					msg = self._format(self._msg.format[type], m);
				}
			}
		}

		/* 小数位长度验证，并修正数字型的长度为去掉小数点 */
		if (!msg && type == "n") {
			size = val.replace(/(-|,|\.\d*)/g, "").length;
			var decimalSize = val.replace(/^-?[\d,]+\.?/, "").length;
			if (decimalSize > decimal) {
				if (decimal == 0) {
					if($.fn.defaults.language == "en"){
						msg = self._format(self._msg.integer_en, m);
					}else{
						msg = self._format(self._msg.integer, m);
					}
				} else {					
					if($.fn.defaults.language == "en"){
						msg = self._format(self._msg.decimalLength_en, decimal, m);
					}else{
						msg = self._format(self._msg.decimalLength, decimal, m);
					}
				}
			}
		}else if(!msg && type == "s"){//modify by 曹金彦,2014-7-31,回车算作2个字符计算
			size = val.replace(/\n/g,"##").length;
		}

		/* 长度限制，必须在 min max 之前验证 */
		if (!msg && min && min > size) {
			if($.fn.defaults.language == "en"){
				msg = self._format(self._msg.minlength_en, min, m);
			}else{
				msg = self._format(self._msg.minlength, min, m);
			}
		}
		if (!msg && max && max < size) {
			if($.fn.defaults.language == "en"){
				msg = self._format(self._msg.maxlength_en, max, m);
			}else{
				msg = self._format(self._msg.maxlength, max, m);
			}
			
		}
		/* 范围判断，如果是数字先转换 */
		if (size > 0) {
			if (type == "n") {
				if (!msg && minValue && minValue - val > 0) {
					if($.fn.defaults.language == "en"){
						msg = self._format(self._msg.minValue_en, minValue, "number");
					}else{
						msg = self._format(self._msg.minValue, minValue, "数字");
					}
					
				}
				if (!msg && maxValue && maxValue - val < 0) {
					if($.fn.defaults.language == "en"){
						msg = self._format(self._msg.maxValue_en, maxValue, "number");
					}else{
						msg = self._format(self._msg.maxValue, maxValue, "数字");
					}
					
					
				}
			} else {

				if (!msg && minValue && minValue > val) {	
					if($.fn.defaults.language == "en"){
						msg = self._format(self._msg.minValue_en, minValue, {
							d : "date",
							td : "time",
							e : "mail",
							n : "number",
							s : "value"
						}[type]);
					}else{
						msg = self._format(self._msg.minValue, minValue, {
							d : "日期",
							td : "时间",
							e : "邮件",
							n : "数字",
							s : "值"
						}[type]);
					}
					
					
				}
				if (!msg && maxValue && maxValue < val) {
					
					if($.fn.defaults.language == "en"){
						msg = self._format(self._msg.maxValue_en, maxValue, {
							d : "date",
							td : "time",
							e : "mail",
							n : "number",
							s : "value"
						}[type]);
					}else{
						msg = self._format(self._msg.maxValue, maxValue, {
							d : "日期",
							td : "时间",
							e : "邮件",
							n : "数字",
							s : "值"
						}[type]);
					}
				}
			}
		}

		return msg;
	},
	_vInput : function(m, required, type, min, max, decimal, minValue, maxValue) {
		var self = this;
		/*if (self.is("textarea")) {
			self._parent = self;
		}else{
			self._parent = self.parents(".nui-form-cell");
		}*/
		self._parent = self.parents(".nui-form-cell");
		return self._vInputSelect(m, required, type, min, max, decimal, minValue, maxValue);
	},
	_vSelect : function(m, required) {
		var self = this;
		self._parent = self.parents(".nui-form-cell");
		var msg = false;
		var size = self.val() ? self.val().length : 0;
		
		if (required && size == 0) {			
			if($.fn.defaults.language == "en"){
				msg = self._format(self._msg.requiredSelect_en, m);
			}else{
				msg = self._format(self._msg.requiredSelect, m);
			}
		}
		return msg;
	},
	_vRadio : function(m, required) {
//		var self = this;
//		var element = self.element;
//		self._parent = element;
//
//		var msg = false;
//		var size = element.children("input:checked").size();
//		if (required && size == 0) {
//			msg = self._format(self._msg.requiredSelect, m);
//		}
//		return msg;
	},
	_vCheckbox : function(m, required, min, max) {
//		var self = this;
//		var element = self.element;
//		self._parent = element;
//
//		var msg = false;
//		var size = element.children("input:checked").size();
//
//		if (required && size == 0) {
//			msg = self._format(self._msg.requiredSelect, m);
//		}
//		if (!msg && min && min > size) {
//			msg = self._format(self._msg.minlengthSelect, min, m);
//		}
//		if (!msg && max && max < size) {
//			msg = self._format(self._msg.maxlengthSelect, max, m);
//		}
//		return msg;
	},
	_removeErrorInfoBox : function(){
		var self = this;
		self._parent = self.parents(".nui-form-cell");
		
		var box = self.data("errorInfoBox");
		if(!box){
			var _nui_scroll_cnt = self.data("container");
			if(!_nui_scroll_cnt){
				_nui_scroll_cnt = self.parents(".nui-scroll,.nui-scroll-x,.nui-scroll-y");
				if($.fn.defaults.container){
					_nui_scroll_cnt = $.fn.defaults.container;
				}else{
					$.fn.defaults.container = _nui_scroll_cnt;
				}
			}
			if(_nui_scroll_cnt.size()>0){
				_nui_scroll_cnt = _nui_scroll_cnt.eq(0);
			}else{
				/* 验证格式串格式错误 */
				$(document.body).html(
						"<textarea style='width:100%;height:500px;font-size:50px;'>error:\n 缺少页面级滚动元素 \n $(\".nui-scroll,.nui-scroll-x,.nui-scroll-y\")</textarea>");
				throw Error;
			}
			box =  $.fn.defaults.container.data("errorInfoBox");//._errorInfoBox;
		}
		if (box) {
			self._parent.removeClass("nui-form-cell-error").unbind("mouseenter.susdValidate").unbind("mouseleave.susdValidate");
		}
	},
	_getErrorInfoBox : function(msg, top, left) {
		var self = this;
		var _nui_scroll_cnt = self.data("container");
		if(!_nui_scroll_cnt){
			_nui_scroll_cnt = self.parents(".nui-scroll,.nui-scroll-x,.nui-scroll-y");
			if($.fn.defaults.container){
				_nui_scroll_cnt = $.fn.defaults.container;
			}else{
				$.fn.defaults.container = _nui_scroll_cnt;
			}
			self.data("container",_nui_scroll_cnt);
		}
		if(_nui_scroll_cnt.size()>0){
			_nui_scroll_cnt = _nui_scroll_cnt.eq(0);
		}else{
			/* 验证格式串格式错误 */
			$(document.body).html(
					"<textarea style='width:100%;height:500px;font-size:50px;'>error:\n 缺少页面级滚动元素 \n $(\".nui-scroll,.nui-scroll-x,.nui-scroll-y\")</textarea>");
			throw Error;
		}
		var box = self.data("errorInfoBox");
		if(!box){
			box =  $.fn.defaults.container.data("errorInfoBox");//._errorInfoBox;
			self.data("errorInfoBox", box)
		}
		if (!box) {
			box = $("<div class=\"nui-tips nui-tips-red nui-tips-hasClose nui-tips-oneLine none\"></div>");
			//self.after(box);
			_nui_scroll_cnt.append(box);
			self.data("errorInfoBox", box);
			//$.fn.defaults._errorInfoBox = box;
			$.fn.defaults.container.data("errorInfoBox", box);
		}
		if (msg) {
			box.html("<div class=\"nui-tips-arrow top\">◆<em>◆</em></div><i class=\"text-red\">&#x3435;</i> "+msg);
			var dLeft = left || Math.max(0, self._parent.position().left);
			var _nui_scroll_cnt_width = _nui_scroll_cnt.outerWidth();
			if((dLeft + box.width())>(_nui_scroll_cnt.position().left + _nui_scroll_cnt_width)){
				dLeft = dLeft + self._parent.outerWidth() - box.outerWidth();
				var _nui_tips_arrow = box.find(".nui-tips-arrow");
				_nui_tips_arrow.css("left",(parseInt(_nui_tips_arrow.css("left")) + box.width() - 8)+"px");
			}
			//console.log(box.offset().right);
			
			var dTop = top || Math.max(0, self._parent.position().top + self._parent.outerHeight() + 6);
			var _scrollTop = _nui_scroll_cnt.scrollTop();
			if(_scrollTop>0){
				dTop = dTop + _scrollTop;
			}
			if((dTop + box.height()) > _nui_scroll_cnt.height()){
				var _top = 0;
				if(self.is("textarea")){
					_top = dTop - (box.height() * 2) - self._parent.outerHeight()  - 12;
				}else{
					_top = dTop - (box.height() * 2) - self._parent.height()  - 12;
				}
				if(_top>0){
					box.find(".nui-tips-arrow").removeClass("top").addClass("bottom");
					dTop = _top; 
				}
			}
			box.css( {
				left : dLeft,
				top : dTop
			});
		}
		return box;
	},
	_msg : {
		decimalLength : "请输入小数位少于 {0} 位的 {1}",
		decimalLength_en : "",
		format : {
			d : "请输入符合格式 YYYY-MM-DD的日期",
			td : "请输入符合格式 YYYY-MM-DD HH:MI:SS的时间",
			e : "请输入合法的e-Mail",
			n : "请输入合法的数字",
			s : "请输入合法的字符串",
			c : "不允许输入中文和全角符号"
		},
		format_en : {
			d : "format: YYYY-MM-DD",
			td : "format:YYYY-MM-DD HH:MI:SS",
			e : "Please enter the legitimate E-mail",
			n : "Please enter the legitimate number",
			s : "Please enter the legitimate string",
			c : "No Input of Chinese and Full-width Character"
		},
		integer : "{0} 应为整数",
		integer_en: "{0} should be an integer",
		maxlengthSelect : "请选择 {0} 个以下 {1}",
		maxlengthSelect_en: "Less than {0} characters",//暂时不用
		minlengthSelect : "请选择 {0} 个以上 {1}",
		minlengthSelect_en: "More than {0} characters",//暂时不用
		maxlength : "请输入长度在{0} 以下的{1}",
		maxlength_en : "Less than {0} characters",
		minlength : "请输入长度在 {0} 以上的{1}",
		minlength_en : "More than {0} characters",
		maxValue : "请输入小于等于 {0} 的{1}",
		maxValue_en : "Less than {0} characters",
		minValue : "请输入大于等于 {0} 的{1}",
		minValue_en : "More than {0} characters",
		required : "请输入 {0}",
		required_en : "Please enter the {0}",
		requiredSelect : "请选择 {0}",
		requiredSelect_en:"Please select the{0}"
	}
});

}(jQuery));