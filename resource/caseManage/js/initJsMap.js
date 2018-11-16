var trackCallbackIds = {},
	personLine = null,
	routeControl = null;//记录每条轨迹
function initMap(){

    var options = {
        closePopupOnClick: false,//点击地图其它地方是否关闭Popup框
        //center: [23.1140683806, 113.3189400854],//地图中心点位
        //baseMapUrl: 'http://172.16.56.4:6080/arcgis/rest/services/gd/MapServer',
        //baseMapUrl: 'http://172.16.56.4:6080/arcgis/rest/services/newMap2/MapServer',
        //zoom: 15//缩放等级
    }

    UI.map.init(options,function(){});
}

function showLayer(type){
	UI.map.initDrawQuery(type,"NAME","geom");
}

function clearMap(){
    UI.map.clearDraw();
}



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