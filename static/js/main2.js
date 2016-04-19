

window.UEDITOR_HOME_URL = "/widget/ueditor/";
// require配置
var widget="widget";
require.config({
    baseUrl: "/",
    paths: {　　　　　　
        "spinner": widget + "/spinner/jquery.spinner",
        "daterangepicker": widget + "/daterangepicker/daterangepicker.jQuery",
        "jqueryui": widget + "/jqueryui/jquery-ui-1.10.2.freight.min",
        "ztree": widget + "/ztree/jquery.ztree.all-3.5.min",
        "fwindow": widget + "/fwindow/fwindow",
        "uedconfig": widget + "/ueditor/ueditor.config",　
        "ueditor": widget + "/ueditor/ueditor.all",
        "fcommon-2.0": widget + "/fcommon-2.0/fcommon-2.0.min",
        "nrichselect": widget + "/nrichselect/nrichselect",
        "nselect": widget + "/nselect/nselect",
        "multiselectFilter": widget + "/multiselect/jquery.multiselect.filter",
        "multiselect": widget + "/multiselect/jquery.multiselect.min",
        "nselect": widget + "/nselect/nselect",
        "RichSelect": widget + "/RichSelect/RichSelect",
        "cpvalidate": widget + "/cpvalidate/cpvalidate",
        "zeroclipboard": widget + "/zeroclipboard/zeroclipboard",
        "oldJquery": widget + "/susd/jquery-1.7.2",
        "bgiframe": widget + "/susd/jquery.bgiframe.min",
        "susd": widget + "/susd/jquery.susd.mini",
        "ajaxfileupload": widget + "/ajaxfileupload/ajaxfileupload",
        "highcharts": "widget/highcharts/highcharts",
        "layer": widget + "/layer/layeramd",
        "layerjs": widget + "/layer/layer",
        // =============================
        "openwin": "/page/openwin/openwin",
        "spinner-config": "/page/spinner/spinner-config",
        "ztree-config": "/page/ztree/ztree-config",
        "ued-config": "/page/ueditor/ued-config",
        "data-config": "/page/daterangepicker/data-config",
        "fwindow-config": "/page/fwindow/fwindow-config",
        "multiselect-config": "/page/multiselect/multiselect-config",
        "nrichselect-config": "/page/nrichselect/nrichselect-config",
        "nselect-config": "/page/nselect/nselect-config",
        "richSelect-config": "/page/richSelect/richSelect-config",
        "highcharts-config": "/page/highcharts/highcharts-config",
        "cpvalidate-config": "/page/cpvalidate/cpvalidate-config"

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
            deps:['css!'+ widget + '/spinner/jquery.spinner']
        },
        'daterangepicker': 
        {
            deps:['jqueryui','css!'+ widget + '/daterangepicker/ui.daterangepicker']
        },
        'jqueryui': 
        {
            deps:['css!'+ widget + '/jqueryui/jquery-ui-1.10.2.freight']
        },
        'ztree': 
        {
            deps:['css!'+ widget + '/ztree/zTreeStyle']
        },
        'fwindow': 
        {
            deps:['jqueryui','css!'+ widget + '/fwindow/fui-dialog']
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
        'multiselect': 
        {
            deps:['jqueryui','multiselectFilter','css!'+ widget + '/multiselect/jquery.multiselect','css!'+ widget + '/multiselect/jquery.multiselect.filter']
        },
        'RichSelect': 
        {
            deps:['jqueryui','css!'+ widget + '/RichSelect/RichSelect']
        },
        'susd': 
        {
            deps:['jqueryui','bgiframe','css!susd/solution','css!'+ widget + '/susd/skin','css!'+ widget + '/susd/smartMenu']
        },

    }
});
