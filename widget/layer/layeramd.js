// 通过requirejs加载时，需要这样设置
define(["layerjs"],function(){
	
	layer.config({
	    path:  "/widget/layer/"//layer.js所在的目录，可以是绝对目录，也可以是相对目录
	});
})