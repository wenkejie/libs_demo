/**
 * jquery.spinner.js
 * @author 陈峰 2015-07-14
 */
;(function($) {
	$.fn.spinner = function(opts) {
		return this.each(function() {
				var defaults = {
					value : 1,
					min : 0,
					max : 100,
					maxlength : 2
				}
				var options = $.extend(true, {}, defaults, opts);
				var keyCodes = {
					up : 38,
					down : 40
				}
				var container = $('<div></div>');
				container.addClass('spinner');
				var textField = $(this).addClass('value').attr('maxlength', options.maxlength).val(options.value)
					.bind('keyup paste change',
						function(e) {
							var field = $(this);
							if (e.keyCode == keyCodes.up)
								changeValue(1);
							else if (e.keyCode == keyCodes.down)
								changeValue(-1);
							else if (getValue(field) != container.data('lastValidValue'))
								validateAndTrigger(field);
						});
				textField.wrap(container);
				// 加+
				var increaseButton = $('<button class="increase">+</button>')
						.click(function() {
								changeValue(1);
							});
				// 减-
				var decreaseButton = $('<button class="decrease"><i></i></button>')
						.click(function() {
								changeValue(-1);
							});
				validate(textField);
				container.data('lastValidValue', options.value);
				textField.before(decreaseButton);
				textField.after(increaseButton);
				// 改变值
				function changeValue(delta) {
					var value = getValue();
					if (!isInvalid(value + delta)) {
						textField.val(value + delta);
					}
					validateAndTrigger(textField);
				}
				// 校验&添加事件
				function validateAndTrigger(field) {
					clearTimeout(container.data('timeout'));
					var value = validate(field);
					if (!isInvalid(value)) {
						textField.trigger('update', [field, value]);
					}
				}
				// 校验
				function validate(field) {
					var value = getValue();
					if (value <= options.min)
						// decreaseButton.attr('disabled', 'disabled');
						decreaseButton.addClass('spinner-disabled');
					else
						// decreaseButton.removeAttr('disabled');
						decreaseButton.removeClass('spinner-disabled');
	
					if (value >= options.max)
						// increaseButton.attr('disabled', 'disabled');
						increaseButton.addClass('spinner-disabled');
					else
						// increaseButton.removeAttr('disabled');
						increaseButton.removeClass('spinner-disabled');
					field.toggleClass('invalid', isInvalid(value))
							.toggleClass('passive', (value === options.min || value === options.max));
	
					if (isInvalid(value)) {
						var timeout = setTimeout(function() {
								textField.val(container.data('lastValidValue'));
								validate(field);
							}, 500);
						container.data('timeout', timeout);
					} else {
						container.data('lastValidValue', value);
					}
					return value;
				}
				// 是否是无效数据
				function isInvalid(value) {
					return isNaN(+value) || value < options.min
							|| value > options.max;
				}
				// 获取数值
				function getValue(field) {
					field = field || textField;
					return parseInt(field.val() || 0, 10);
				}
			})
	}
})(jQuery)
