
// 请求调用spinner插件

define(["fwindow"], function() {
   // 弹窗设置
    $('div.mould').delegate('a.j-notice', 'click', function() {
        var that = $(this);
        var htmlWin;
        htmlWin = fwindow.create({
            title: "操作提示",
            content: "<div class=\"confirm-cnt confirm-warning tal\" ><div class=\"confirm-icon\"></div><h3>您确定要删除此记录吗？</h3><p class='mb5 fwb'></p><p class='  scroll-y'>删除后，您可在回收站还原，或永久删除。</p></div><div class=\"fui-dialog-btm-bar\"><div class=\"checkbox-bar\"><input type=\"checkbox\" class=\"checkbox\" id=\"noLongerShow\"><label for=\"noLongerShow\">不再显示</label></div><a id=\"btn-yes\" class=\"fui-btn-dialog\" href=\"javascript:\"\"><span>确定</span></a><a id=\"btn-no\" class=\"fui-btn-dialog\" href=\"javascript:\"\"><span>取消</span></a></div>",
            width: 400,
            height: 150
        });

        htmlWin.find("#btn-yes").click(function() {
            htmlWin.fwindow("close");
            // trDelete(that.parents("tr"));
            showRetrunMessage("成功删除");
            // susd.overlay(false,{delay:2});
            // setTimeout(function () {
            //     susd.overlay(true);
            // },2000);
            // susd.overlay(true);
            return true;
        });
        htmlWin.find("#btn-no").click(function() {
            htmlWin.fwindow("close");
            return true;
        });
    }).delegate('a.j-open-win', 'click', function() {
        var that = $(this);
        var htmlWin;
        htmlWin = fwindow.create({
            title: "操作提示",
            content: "<div class=\"fui-dialog-cnt\" >随便放点什么你开心就好</div><div class=\"fui-dialog-btm-bar\"><a id=\"btn-yes\" class=\"fui-btn-dialog\" href=\"javascript:\"\"><span>确定</span></a><a id=\"btn-no\" class=\"fui-btn-dialog\" href=\"javascript:\"\"><span>取消</span></a></div>",
            width: 400,
            height: 150
        });
        
    });
})