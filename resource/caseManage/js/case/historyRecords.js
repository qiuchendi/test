
var plate = UI.util.getUrlParam("plate")||"";
var plateColorClass = UI.util.getUrlParam("plateColorClass")||"";
var carLogo = UI.util.getUrlParam("carLogo")||"";
var vehicleColor = UI.util.getUrlParam("vehicleColor")||"";
var daysBeforeCase = UI.util.getUrlParam("daysBeforeCase")||"";



var historyListForm = {
	//beginTime: parent.caseInitialST,
	beginTime: getBeforeOrAfter(parent.caseStartTime, daysBeforeCase, '-'),
	//endTime: parent.caseInitialET,
	endTime: parent.caseStartTime,
	plateInfo: plate,
	tollgateIds: parent.tollgateIds,
};

$(function() {
	UI.control.init();
	initData();
	initEvent();
})

function initData() {
	$('#plateAndColor').addClass(plateColorClass).text(plate);
	$('#carLogo').text(carLogo);
	$('#vehicleColor').text(vehicleColor);
}
function initEvent() {
	
}