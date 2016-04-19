
// 请求调用spinner插件

define(["daterangepicker"], function() {
    // datapick初始化
    $("#datepicker").unbind("click");
    $( "#datepicker" ).daterangepicker({
       arrows:true
    });
})