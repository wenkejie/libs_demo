
// require配置
require.config({
    baseUrl: "./",
    paths: {　　　　　　
        "spinner": "widget/spinner/jquery.spinner",
        "daterangepicker": "widget/daterangepicker/daterangepicker.jQuery",
        "jqueryui": "widget/jqueryui/jquery-ui",
        "ztree": "widget/ztree/jquery.ztree.all-3.5.min",
        "fwindow": "widget/fwindow/fwindow",
        "uedconfig": "widget/ueditor/ueditor.config",　
        "ueditor": "widget/ueditor/ueditor.all",
        "fcommon-2.0": "widget/fcommon-2.0/fcommon-2.0.min",
        "nrichselect": "widget/nrichselect/nrichselect",
        "nselect": "widget/nselect/nselect",
        "multiselectFilter": "widget/multiselect/jquery.multiselect.filter",
        "multiselect": "widget/multiselect/jquery.multiselect.min",
        "nselect": "widget/nselect/nselect",
        "RichSelect": "widget/RichSelect/RichSelect",
        "cpvalidate": "widget/cpvalidate/cpvalidate",
        "zeroclipboard": "widget/zeroclipboard/zeroclipboard",
        "oldJquery": "widget/susd/jquery-1.7.2",
        "foverlay": "widget/susd/foverlay",
        "bgiframe": "widget/susd/jquery.bgiframe.min",
        "susd": "widget/susd/jquery.susd",
        "ajaxfileupload": "widget/ajaxfileupload/ajaxfileupload",
        "highcharts": "widget/highcharts/highcharts"
    },
    waitSeconds: 15,
    map: {
        '*': {
            'css': 'static/js/css.min'
        }
    },
    shim: {
        'spinner': 
        {
            deps:['css!widget/spinner/jquery.spinner']
        },
        'daterangepicker': 
        {
            deps:['css!widget/daterangepicker/ui.daterangepicker']
        },
        'jqueryui': 
        {
            deps:['css!widget/jqueryui/jquery-ui-1.10.2.freight']
        },
        'ztree': 
        {
            deps:['css!widget/ztree/zTreeStyle']
        },
        'fwindow': 
        {
            deps:['jqueryui','css!widget/fwindow/fui-dialog']
        },
        'ueditor': 
        {
            deps:['uedconfig']
        },
        'nrichselect': 
        {
            deps:['jqueryui']
        },
        'nselect': 
        {
            deps:['jqueryui']
        },
        'multiselectFilter': 
        {
            deps:['jqueryui']
        },
        'multiselect': 
        {
            deps:['multiselectFilter','css!widget/multiselect/jquery.multiselect','css!widget/multiselect/jquery.multiselect.filter']
        },
        'RichSelect': 
        {
            deps:['jqueryui','css!widget/RichSelect/RichSelect']
        },
        'susd': 
        {
            deps:['jqueryui','bgiframe','css!widget/susd/solution','css!widget/susd/skin','css!widget/susd/smartMenu'],
            exports: "susd"
        }

    }
});

require([
    'zeroclipboard',
    'susd',
    'multiselect',
    'spinner',
    'daterangepicker',
    'jqueryui',
    'ztree',
    'fwindow',
    'ueditor',
    'nrichselect',
    'nselect',
    'RichSelect',
    'cpvalidate',
    'ajaxfileupload',
    "highcharts"
    ], 
    function(zeroclipboard,susd,multiselect) {　　
    
    function showRetrunMessage(msg) {
        var $message = $('<div>', {
            'class': 'nui-return-message',
            'text': msg
        });
        // $message.css({top:(top + 100)})
        $message.appendTo('body').fadeIn().delay(800).fadeOut(function() {
            $message.remove();
        });
    }

    // spinner初始化　
    $('.spinner').spinner({
        value: 0,
        max: 5
    });

    // datapick初始化
    $("#datepicker").unbind("click");
    $( "#datepicker" ).daterangepicker({
       arrows:true
    });
    // $("#datetime").unbind("click");
    // $("#datetime").daterangepicker({
    //         arrows:true
    //  });
    //  
    // ztree初始化
    var setting = {
    check: {
        enable: true
    },    
    data: {
          key: {
              title:"t"
          },
          simpleData: {
              enable: true
          }
        },
        callback: {
            beforeClick: beforeClick,
            onClick: onClick
        }
    };

    var zNodes =[
        { id:1, pId:0, name:"普通的父节点", t:"我很普通，随便点我吧", open:true},
        { id:11, pId:1, name:"叶子节点 - 1", t:"我很普通，随便点我吧"},
        { id:12, pId:1, name:"叶子节点 - 2", t:"我很普通，随便点我吧"},
        { id:13, pId:1, name:"叶子节点 - 3", t:"我很普通，随便点我吧"},
        { id:2, pId:0, name:"NB的父节点", t:"点我可以，但是不能点我的子节点，有本事点一个你试试看？", open:true},
        { id:21, pId:2, name:"叶子节点2 - 1", t:"你哪个单位的？敢随便点我？小心点儿..", click:false},
        { id:22, pId:2, name:"叶子节点2 - 2", t:"我有老爸罩着呢，点击我的小心点儿..", click:false},
        { id:23, pId:2, name:"叶子节点2 - 3", t:"好歹我也是个领导，别普通群众就来点击我..", click:false},
        { id:3, pId:0, name:"郁闷的父节点", t:"别点我，我好害怕...我的子节点随便点吧...", open:true, click:false },
        { id:31, pId:3, name:"叶子节点3 - 1", t:"唉，随便点我吧"},
        { id:32, pId:3, name:"叶子节点3 - 2", t:"唉，随便点我吧"},
        { id:33, pId:3, name:"叶子节点3 - 3", t:"唉，随便点我吧"}
    ];

    var log, className = "dark";
    function beforeClick(treeId, treeNode, clickFlag) {
        className = (className === "dark" ? "":"dark");
        showLog("[ "+getTime()+" beforeClick ]&nbsp;&nbsp;" + treeNode.name );
        return (treeNode.click != false);
    }
    function onClick(event, treeId, treeNode, clickFlag) {
        showLog("[ "+getTime()+" onClick ]&nbsp;&nbsp;clickFlag = " + clickFlag + " (" + (clickFlag===1 ? "普通选中": (clickFlag===0 ? "<b>取消选中</b>" : "<b>追加选中</b>")) + ")");
    }       
    function showLog(str) {
        if (!log) log = $("#log");
        log.append("<li class='"+className+"'>"+str+"</li>");
        if(log.children("li").length > 8) {
            log.get(0).removeChild(log.children("li")[0]);
        }
    }
    function getTime() {
        var now= new Date(),
        h=now.getHours(),
        m=now.getMinutes(),
        s=now.getSeconds();
        return (h+":"+m+":"+s);
    }

    $(document).ready(function(){
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
    });

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

    // 富文本编辑器实例化
    // 
    var ue = UE.getEditor('container');


    $("#j-nselect").nrichselect({ 
       size : 6,
       readonly: false,
       items:[{text:'usd',value:30},{text:'1111',value:30},{text:'usd',value:30},{text:'usd',value:30},{text:'usd',value:30},{text:'usd',value:30}]//,
       //readonly:isReadOnly
    });

    $("#j-test-nselect").nselect({ 
        width:200,
        size:4,
        items:[
               {"text":"基本港和非基本港","value":"1"},
               {"text":"仅基本港","value":"2"}
               ]
    });


    $("#j-multiselect").multiselect({
        // selectedList:10,//可以显示的选项
        // multiple:true,//是否多选 
        // isimg:false,
        // div:".nui-form-cell",
        // height: 145,
        // header: "最多选择10个",
        // footer:true
    });

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

    $('#j-sudu-turn').click(function() {
        // susd.overlay(false);
         susd.overlay(false,{delay:2});
        setTimeout(function () {
             susd.overlay(true);
        },12000);
    });

    zeroclipboard.config({swfPath:'/img/ZeroClipboard.swf'});
    var clip = new zeroclipboard($("a.j-copy"));
    clip.on("load", function (client) {
        client.on("complete", function (client, args) {
            alert("复制成功");
        });
    });


    $('a.j-updata-check').click(function() {
        $('input.j-check-input').validate();
        alert('验证失败');
    });

    function ajaxFileUpload() {
        $.ajaxFileUpload({
            url: '/img', //用于文件上传的服务器端请求地址
            secureuri: false, //是否需要安全协议，一般设置为false
            fileElementId: 'file1', //文件上传域的ID
            dataType: 'json', //返回值类型 一般设置为json
            success: function(data, status) //服务器成功响应处理函数
                {
                    $("#img1").attr("src", data.imgurl);
                    if (typeof(data.error) != 'undefined') {
                        if (data.error != '') {
                            alert(data.error);
                        } else {
                            alert(data.msg);
                        }
                    }
                },
            error: function(data, status, e) //服务器响应失败处理函数
                {
                    alert(e);
                }
        })
        return false;
    };

    $('a.j-upload').click(function() {
        ajaxFileUpload();
    });

    $('#chartTest').highcharts({                   //图表展示容器，与div的id保持一致
        chart: {
            type: 'column'                         //指定图表的类型，默认是折线图（line）
        },
        title: {
            text: 'My first Highcharts chart'      //指定图表标题
        },
        xAxis: {
            categories: ['my', 'first', 'chart']   //指定x轴分组
        },
        yAxis: {
            title: {
                text: 'something'                  //指定y轴的标题
            }
        },
        series: [{                                 //指定数据列
            name: 'Jane',                          //数据列名
            data: [1, 0, 4]                        //数据
        }, {
            name: 'John',
            data: [5, 7, 3]
        }]
    });

});