/**
 * @author xlg
 * @version 2018-07-02
 */
 
 $(function() {
 	initCommonEvent();
 })

function initCommonEvent() {
	//图片放大
	$("body").on("click","[attrimg='zoom']",function(){
		var $this = $(this);
		var url = $this.attr("src");
		if ( $this.attr("zoom-url") != undefined && $this.attr("zoom-url") != "") {
			url = $this.attr("zoom-url");
		}
		var options = {
				isSlide: false,
				series:[url]
		}
		$.photoZoom(options);
	});

	//双图图片放大
	$("body").on("click","[attrimg='doublezoom']",function(){
		var $this = $(this);
		var $img = $this.find("img");
		var parentBox = $this.parents('.listviewImgBox');
		var baseImg,seriesImg,_series,showIndex = 0;
		var isListView = false;
		var shotPic = $this.attr('shotpic');
		// 列表展示图片
		if(parentBox.length > 0){
			isListView = true;
			baseImg = [];   seriesImg= [];
			
			// 计算当前图片所在 索引
			if(parentBox.find('[pic-order]').length >0 && ($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'))){ //已经自定义序号
				showIndex = parseInt($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'));
			}else{
				// 为每个列表添加 listview-item 属性
				parentBox.find("[attrimg='doublezoom']").each(function(index,item){
					$(this).attr('pic-order',index);
				});
				showIndex = parseInt($this.attr('pic-order') || $this.parent('.pic-order').attr('pic-order'));
			}
			
			// 图片展示列表数组
			parentBox.find('[attrimg="doublezoom"]').each(function(index,item){
					baseImg.push($(this).find('img').eq(0).attr('src'));
//					seriesImg.push($(this).find('img').eq(1).attr('src'));
					seriesImg.push({
						'src': $(this).find('img').eq(1).attr('src'),
						'mess': renderPicMsg(parentBox,index)
					})
			})
			_series = seriesImg;
			
		// 普通方式展示图片
		}else{
			baseImg = $img.eq(0).attr("src");
			seriesImg = $img.eq(1).attr("src");
			if ($img.eq(0).attr("zoom-url") != undefined ) {
				baseImg = $img.eq(0).attr("zoom-url");
			}
			
			if ($img.eq(1).attr("zoom-url") != undefined ) {
				seriesImg = $img.eq(1).attr("zoom-url");
			}
			_series = [{'src':seriesImg,'show':true}];
		}
		
		var options = {
			isCompare: true,
			isSlide: false,
			isListView: isListView,
			series: _series,
			baseImg: baseImg,
			showIndex: showIndex,
			isMessage: isListView,
			isShotPic: shotPic,
			shotCallback: function(data){
				var params = {
						src: '/efacecloud/page/library/shotPicture.html?fileSrc='+((shotPic == "left")? data.lsrc : data.rsrc)+'&jgsj='+data.message['时间']+'&deviceName='+data.message['设备名称'],
						title: '全景图抠图',
						width: $(top.window).width()*.95,
						height: $(top.window).height()*.9,
						callback: function(data){}
				}
				top.UI.util.openCommonWindow(params);
			}
	    }
		$.photoZoom(options);
	});
}




// 关闭提示信息
function uiTipsClose() {
	$('.notify').remove();
}


//渲染车牌颜色
function renderPlateColor(plateColor) {
	var plateColorClass = '';
	if(plateColor=='0') {
		plateColorClass = 'plate-white';
	}else if(plateColor=='1') {
		plateColorClass = 'plate-yellow';
	}else if(plateColor=='2') {
		plateColorClass = 'plate-blue';
	}else if(plateColor=='3') {
		plateColorClass = 'plate-black';
	}else if(plateColor=='4'){
		plateColorClass = 'plate-green';
	}
	return plateColorClass;
}
//渲染车身颜色
function renderVehicleColor(vehicleColor) {
	var colorName = '';
	if(vehicleColor == 'A') {
		colorName = '白色';
	}else if(vehicleColor == 'B') {
		colorName = '灰色';
	}else if(vehicleColor == 'C') {
		colorName = '黄色';
	}else if(vehicleColor == 'D') {
		colorName = '粉色';
	}else if(vehicleColor == 'E') {
		colorName = '红色';
	}else if(vehicleColor == 'F') {
		colorName = '紫色';
	}else if(vehicleColor == 'G') {
		colorName = '绿色';
	}else if(vehicleColor == 'H') {
		colorName = '蓝色';
	}else if(vehicleColor == 'I') {
		colorName = '棕色';
	}else if(vehicleColor == 'J') {
		colorName = '黑色';
	}else if(vehicleColor == 'Z') {
		colorName = '其他';
	}else{
		colorName = '未知';
	}
	return colorName;
}


/**
 * @author xlg
 * 获取当前时间的前或后n天
 */
function getBeforeOrAfter(curDateStr, n, beforeOrAfter) { 
	if(n == '' || n == 0) {
		return curDateStr;
	}
	var curDateStrMS = new Date(curDateStr).getTime();
	if(beforeOrAfter == '-') {
		curDateStrMS -= 1000*60*60*24*n;
		return new Date(curDateStrMS).format("yyyy-MM-dd HH:mm:ss");
	}else{
		curDateStrMS += 1000*60*60*24*n;
		return new Date(curDateStrMS).format("yyyy-MM-dd HH:mm:ss");
	}
} 


function getBeforeOrAfterHours(curDateStr, n, beforeOrAfter) { 
	if(n == '' || n == 0) {
		return curDateStr;
	}
	var curDateStrMS = new Date(curDateStr).getTime();
	if(beforeOrAfter == '-') {
		curDateStrMS -= 1000*60*60*n;
		return new Date(curDateStrMS).format("yyyy-MM-dd HH:mm:ss");
	}else{
		curDateStrMS += 1000*60*60*n;
		return new Date(curDateStrMS).format("yyyy-MM-dd HH:mm:ss");
	}
} 





/*
* 地图显示轨迹
* @author xlg
*/
// function showTracksOnMap(opts,clearFlag,notValidate){
// 	var routePopup = '<div class="maplayer-wrap">'+
// 		'<div class="layer camera">'+
// 		'<div class="layer-caption">'+
// 		'<div class="title">详情</div>'+
// 		'</div>'+
// 		'<div class="layer-content con2">'+
// 		'<div class="main-msg left-msg">'+
// 		'<p>抓拍时间：<span class="iB-span">{%=o.jgsj%}</span></p>'+
// 		'<p>抓拍地点：<span class="iB-span">{%=o.name%}</span></p>'+
// 		'</div>'+
// 		'</div>'+
// 		'</div>'+
// 		'</div>';
// 	var	palyArr = [],
// 		diffFlag = false;
// 	for(var i = 0,len = opts.length;i < len;i++){
// 		for(var j = i+1;j < len;j++){
// 			if(opts[i].X != opts[j].X || opts[i].Y != opts[j].Y){
// 				diffFlag = true;
// 				break;
// 			}
// 		}
// 		if(diffFlag){
// 			break;
// 		}
// 	}
// 	if(!diffFlag && !notValidate){
// 		UI.util.alert('经纬度一样，无法生成轨迹！', 'warn');
// 		return false;
// 	}
// 	$.each(opts,function(i,n){
// 		var playObj = {};
// 		if(n.X && n.Y){
// 			playObj.id = i;
// 			playObj.title = i+1;
// 			playObj.name = n.zpdd;
// 			playObj.image = n.PIC_VEHICLE;
// 			playObj.txmc1 = n.qjturl;
// 			playObj.time = n.TIME;
// 			playObj.x = n.X;
// 			playObj.y = n.Y;
// 			playObj.jgsj = n.jgrqsj;
// 			palyArr.push(playObj);
// 		}
// 	});
// 	if(palyArr.length > 0){
// 		if(notValidate) {
// 			var playOpts = {
// 				routeInfo:palyArr,
// 				routePopup:routePopup,
// 				iconType:"car"
// 			};
// 			getActiveIframe().loadRoute(playOpts);
// 		}else{
// 			if(palyArr.length < opts.length){
// 				UI.util.alert((opts.length-palyArr.length)+"条数据的坐标缺失","warn");
// 			}
// 			var playOpts = {
// 				routeInfo:palyArr,
// 				routePopup:routePopup,
// 				iconType:"car"
// 			};
// 			getActiveIframe().loadRoute(playOpts);
// 		}
// 	}
// 	else{
// 		UI.util.alert("坐标缺失,无法生成轨迹","warn");
// 	}

// }
//播放轨迹
function loadRoute(opts){
	if(!routeControl){
		routeControl = UI.L.trackControl().addTo(UI.map.getMap());
	}
	var iconUrl = opts.iconType == "person"?'/portal/images/map/person.png':'/portal/images/map/car.png';
	if(opts.iconType == "person"){
		opts.vehicle ="foot";
	}
	else if(opts.iconType == "car"){
		opts.vehicle ="car";
	}
	else{
		opts.vehicle ="car";
	}
	routeControl.loadRouteInfo(opts.routeInfo,
	{
		vehicle:opts.vehicle,
		markerUrl:iconUrl,
		markerSize:[32,32],
		getPopup:function(layer){
			var info = layer.options.properties;//轨迹点位
	        var popupHtml = tmpl(opts.routePopup,info);
	        return popupHtml;
		}
	});
}



