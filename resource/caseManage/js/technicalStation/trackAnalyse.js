

// var beginTime = UI.util.getUrlParam("beginTime")||"2018-05-02 11:11:11";
// var endTime = UI.util.getUrlParam("endTime")||"2018-05-02 22:22:22";
// var plate = UI.util.getUrlParam("plate")||"粤1111";

var beginTime = UI.util.getUrlParam("beginTime")||"";
var endTime = UI.util.getUrlParam("endTime")||"";
var plate = UI.util.getUrlParam("plate")||"";

var trackForm = {
	beginTime: beginTime,
	endTime: endTime,
	order: 'asc', // asc(升序)或desc（desc）
	sort: '', // 如：PASS_TIME(按过车时间排序)
	plateInfo: plate,
	tollgateIds: parent.parentTollgateIds,
	pageNo:1,
	pageSize:1000
}


$(function() {
	initTrackData();
	initEvent();
});


function initTrackData() {

	// var XY = [{
	// 	X: '113.48635585445423',
	// 	Y: '23.16795122483069'
	// },{
	// 	X: '113.51285353221515',
	// 	Y: '23.159270951081425'
	// }];
	// 轨迹分析车辆查询
	UI.control.remoteCall('vehicle/search/trajectory', trackForm, function(resp){
		if(resp.data.length > 0) {
			$('#nodata').addClass('hide');
			$("#trackAnalyse").html(tmpl('trackAnalyseTmpl',resp.data));
			// $.each(resp.data, function(i,o){
			// 	o.longtitute = XY[i].X;
			// 	o.latitude = XY[i].Y;
			// })
			if(resp.data.length >= 2) {
				showTracksOnMap(resp.data);
			}else{
				UI.util.alert('经纬度坐标数小于2，无法生成轨迹！', 'warn');
			}
			
		}else{
			$('#nodata').removeClass('hide');
		}
	}, function(error) {
	},{async: true});
}


function initEvent() {

	// 点击显示气泡
	$('#trackAnalyse').on('click', 'li', function() {
		parent.routeControl.showNodePopup($(this).data('index'));//根据ID显示气泡
	})

}



/*
* 地图显示轨迹
* @author xlg
*/
function showTracksOnMap(opts,clearFlag){
	var routePopup = '<div class="maplayer-wrap">'+
		'<div class="layer camera">'+
		'<div class="layer-caption">'+
		'<div class="title">详情</div>'+
		'</div>'+
		'<div class="layer-content con2">'+
		'<div class="main-msg left-msg">'+
		'<p>抓拍时间：<span class="iB-span">{%=o.jgsj%}</span></p>'+
		'<p>抓拍地点：<span class="iB-span">{%=o.name%}</span></p>'+
		'</div>'+
		'</div>'+
		'</div>'+
		'</div>';
	var	palyArr = [],
		diffFlag = false;
	for(var i = 0,len = opts.length;i < len;i++){
		for(var j = i+1;j < len;j++){
			if(opts[i].longtitute != opts[j].longtitute || opts[i].latitude != opts[j].latitude){
				diffFlag = true;
				break;
			}
		}
		if(diffFlag){
			break;
		}
	}
	if(!diffFlag){
		UI.util.alert('经纬度一样，无法生成轨迹！', 'warn');
		return false;
	}
	$.each(opts,function(i,n){
		var playObj = {};
		if(n.longtitute && n.latitude){
			playObj.id = i;
			playObj.title = i+1;
			playObj.name = n.tollgateName;
			playObj.image = n.accessDT;
			playObj.txmc1 = n.accessDT;
			playObj.time = n.accessDT;
			playObj.x = n.longtitute;
			playObj.y = n.latitude;
			playObj.jgsj = n.accessDT;
			palyArr.push(playObj);
		}
	});
	if(palyArr.length > 0){
		if(palyArr.length < opts.length){
			UI.util.alert((opts.length-palyArr.length)+"条数据的坐标缺失","warn");
		}
		var playOpts = {
			routeInfo:palyArr,
			routePopup:routePopup,
			iconType:"car"
		};
		parent.loadRoute(playOpts);
	}
	else{
		UI.util.alert("坐标缺失,无法生成轨迹","warn");
	}

}

