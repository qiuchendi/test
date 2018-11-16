
// var beginTime = UI.util.getUrlParam("beginTime")||"2018-05-02 11:11:11";
// var endTime = UI.util.getUrlParam("endTime")||"2018-05-02 22:22:22";
// var plate = UI.util.getUrlParam("plate")||"粤1111";

var beginTime = UI.util.getUrlParam("beginTime")||"";
var endTime = UI.util.getUrlParam("endTime")||"";
var plate = UI.util.getUrlParam("plate")||"";

var plateColorClass = UI.util.getUrlParam("plateColorClass")||"";
var vehicleColor = UI.util.getUrlParam("vehicleColor")||"";
var carLogo = UI.util.getUrlParam("carLogo")||"";

var frequencyForm = {
	beginTime: beginTime,
	endTime: endTime,
	plateInfo: plate,
}


$(function() {
	initTrackData();
	initEvent();
});


function initTrackData() {


	$('#plateAndColor').addClass(plateColorClass).text(plate);
	$('#carLogo').text(carLogo);


	// var XY = [{
	// 	X: '113.48635585445423',
	// 	Y: '23.16795122483069'
	// },{
	// 	X: '113.51285353221515',
	// 	Y: '23.159270951081425'
	// },{
	// 	X: '113.61285353221515',
	// 	Y: '23.179270951081425'
	// },{
	// 	X: '113.66285353221515',
	// 	Y: '23.171270951081425'
	// }];

	// 频次分析车辆查询
	UI.control.remoteCall('vehicle/search/frequencyAnalysis', frequencyForm, function(resp){

		if(resp.data.length > 0) {
			$('#nodata').addClass('hide');
			$("#frequencyAnalyse").append(tmpl('frequencyAnalyseTmpl',resp.data));
			var frequencyData = [];
			$.each(resp.data, function(i,o){
				frequencyData = frequencyData.concat(resp.data[i].list);
			})
			// $.each(frequencyData, function(index, value) {
			// 	value.LONGITUTE = XY[i].X ? XY[i].X : '';
			// 	value.LATITUDE = XY[i].Y ? XY[i].Y : '';
			// })
			// 过车次数
			$('#passTimes').text(frequencyData.length);
			
			if(frequencyData.length >= 2) {
				showTracksOnMap(frequencyData);
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
			if(opts[i].LONGITUTE != opts[j].LONGITUTE || opts[i].LATITUDE != opts[j].LATITUDE){
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
		if(n.LONGITUTE && n.LATITUDE){
			playObj.id = i;
			playObj.title = i+1;
			playObj.name = n.TOLLGATE_NAME;
			playObj.image = n.PIC_ABBREVIATE;
			playObj.txmc1 = n.FORMAT_PASS_TIME;
			playObj.time = n.FORMAT_PASS_TIME;
			playObj.x = n.LONGITUTE;
			playObj.y = n.LATITUDE;
			playObj.jgsj = n.FORMAT_PASS_TIME;
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

