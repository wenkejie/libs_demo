
// 请求调用spinner插件

define(["nrichselect"], function() {
    // ztree初始化
    $("#j-nselect").nrichselect({ 
       size : 6,
       readonly: false,
       items:[{text:'usd',value:30},{text:'1111',value:30},{text:'usd',value:30},{text:'usd',value:30},{text:'usd',value:30},{text:'usd',value:30}]//,
       //readonly:isReadOnly
    });
})