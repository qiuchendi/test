
var bodyClass = UI.util.getUrlParam("bodyClass")||"";

var beginTime = UI.util.getUrlParam("beginTime")||"";
var endTime = UI.util.getUrlParam("endTime")||"";
var plate= UI.util.getUrlParam("plate") || "";
var plateColorClass= UI.util.getUrlParam("plateColorClass") || "";
var carLogo= UI.util.getUrlParam("carLogo") || "";

var pageUrl = UI.util.getUrlParam("pageUrl")||'';


var trackFrequencyParams = 'beginTime=' + beginTime + '&endTime=' + endTime + '&plate=' + plate + '&plateColorClass=' + plateColorClass + '&carLogo=' + carLogo;

$(function(){
	if(bodyClass) {
		$('body').addClass(bodyClass);
	}
	initEvent();
	initMap();
});

function initEvent(){
	$("#leftMainDiv iframe").attr("src",pageUrl + '?' + trackFrequencyParams);
}
