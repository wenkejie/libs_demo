
// 请求调用layer插件

define(["layer"], function() {
    // 信息框
    $('#info1').on('click', function() {
         layer.alert('见到你真的很高兴', {icon: 6});
    });

    $('#info2').on('click', function() {
        layer.msg('你确定你很帅么？', {
            time: 0 //不自动关闭
                ,
            btn: ['必须啊', '丑到爆'],
            yes: function(index) {
                layer.close(index);
                layer.msg('雅蠛蝶 O.o', {
                    icon: 6,
                    btn: ['嗷', '嗷', '嗷']
                });
            }
        });
    });

    $('#info3').on('click', function() {
         layer.msg('这是最常用的吧');
    });

    $('#info4').on('click', function() {
         layer.msg('不开心。。', {icon: 5});
    });

    $('#info5').on('click', function() {
         layer.msg('玩命卖萌中', function(){
            //关闭后的操作
        });
    });

   
    // 页面层/iframe
    $('#p1').on('click', function() {
        layer.open({
            type: 1,
            area: ['600px', '360px'],
            shadeClose: true, //点击遮罩关闭
            content: '\<\div style="padding:20px;">自定义内容\<\/div>'
        });
    });
    $('#p2').on('click', function(){
        layer.open({
            type: 2,
            title: 'iframe父子操作',
            maxmin: true,
            shadeClose: true, //点击遮罩关闭层
            area : ['800px' , '520px'],
            content: 'https://www.baidu.com'
        });
    });
    $('#p3').on('click', function(){
        layer.open({
            type: 2,
            title: false,
            area: ['630px', '360px'],
            shade: 0.8,
            closeBtn: 0,
            shadeClose: true,
            content: 'http://player.youku.com/embed/XMjY3MzgzODg0'
        });
    });

    // 加载层
    $('#lDing1').on('click', function(){
        layer.load();
        //此处演示关闭
        setTimeout(function(){
            layer.closeAll('loading');
        }, 2000);
    });


    // tips
    $('#tips1').on('click', function(){
        layer.tips('这是个提示', '#tips1', {
            tips: [1, '#0FA6D8'] //还可配置颜色
        });
    });
    $('#tips2').on('click', function(){
        layer.tips('这是个提示', '#tips2', {
            tips: [2, '#0FA6D8'] //还可配置颜色
        });
    });
    $('#tips3').on('click', function(){
        layer.tips('这是个提示', '#tips3', {
            tips: [3, '#0FA6D8'] //还可配置颜色
        });
    });
    $('#tips4').on('click', function(){
        layer.tips('这是个提示', '#tips4', {
            tips: [4, '#0FA6D8'] //还可配置颜色
        });
    });


    // 其他一些特定的案列
    $('#other1').on('click', function(){
        //默认prompt
        layer.prompt(function(val){
            layer.msg('得到了'+val);
        });
    });
    
    $('#other2').on('click', function(){
        //屏蔽浏览器滚动条
        layer.open({
            content: '浏览器滚动条已锁',
            scrollbar: false
        });
    });
    $('#other3').on('click', function(){
        //弹出即全屏
        var index = layer.open({
            type: 2,
            content: 'http://www.layui.com',
            area: ['300px', '195px'],
            maxmin: true
        });
        layer.full(index);
    });
    $('#other4').on('click', function(){
        //正上方
        layer.msg('灵活运用offset', {
            offset: 0,
            shift: 6
        });
    });

    
   
})