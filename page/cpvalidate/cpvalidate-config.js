
// 请求调用spinner插件

define(["cpvalidate"], function() {
    
    $('a.j-updata-check').click(function() {
        $('input.j-check-input').validate();
        alert('验证失败');
    });
})