
// 请求调用spinner插件

define(["nselect"], function() {
    
    $("#j-test-nselect").nselect({ 
        width:200,
        size:4,
        items:[
               {"text":"基本港和非基本港","value":"1"},
               {"text":"仅基本港","value":"2"}
               ]
    });
})