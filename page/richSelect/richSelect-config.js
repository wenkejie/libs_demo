
// 请求调用spinner插件

define(["RichSelect"], function() {
    
    $('#j-test-RichSelect').on('focus',function(){
        var field = this;
        field.select();
        var richStr="lclExportDischargeFeeRichSelect";
        var a = new RichSelect(field,richStr,function(){return {custName:field.value};},
                    [field.id],["目的港"]);
        a.selectInputDown.css('width',280);
        a.setExist(true,"在目的港信息中",true,0);
        //a.setDataArray(1);
        return false;
    });
})