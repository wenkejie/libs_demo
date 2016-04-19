/**
 * @version 1.0.0
 * @author 魏长浩 2013-06-18
 * @depends jquery-1.9.1.js
 * @description 提供简单页面加载遮罩功能，顶层页面不可有滚动条
 * @param isShow 当该参数为true时，显示遮罩，并且根据参数delay设定延时显示；当设置为false时，隐藏遮罩，隐藏时，不受delay限制
 * @param delay 设置遮罩延时显示，单位毫秒
 * @method 顶层窗口直接调用 $.foverlay(true,1000);  非顶层窗口可通过top.$.foverlay(false);调用
 */
(function($) {
	var overlayInterval;
	$.foverlay = function(isShow,delay) {
		isShow = isShow || false;
		delay = delay || 0;
		if(window == top){
			var overlay = $(".fui-loading-overlay");
			var loading = $(".fui-loading");
			if(overlay.length<1 || loading.length<1){
				overlay = $("<div class=\"fui-loading-overlay none\"></div>");
				loading = $("<div class=\"fui-loading none\"></div>");
				$("body").append(overlay);
				$("body").append(loading);
			}
			if(isShow){
				overlayInterval = window.setTimeout(function(){
						overlay.removeClass("none");
						loading.removeClass("none");
					},delay);
			}else{
				window.clearTimeout(overlayInterval);
				loading.addClass("none");
				overlay.addClass("none");
			}
		}
	};
}(jQuery));