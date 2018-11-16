/**
 * @author xlg
 * @version 2018-07-02
 */


var ajbh = UI.util.getUrlParam("ajbh")||""; // 案件编号

var initMapTF = false; // 只渲染一次地图
var curStep = 0; // 当前步骤
var maxStep = 0; // 已进入过的最大步骤
var oneOrSubs = false; // 记录一步或者分步研判：true: 一步 false: 分步

var caseTabList = $('#caseTab .case-tab-list'); // 顶部四个主步骤
var caseContent = $('#caseContentWrap .case-content'); // 顶部四个主步骤对应的content tab
var prevStep = $('#prevStep'); // 返回上一个步骤
var nextStep = $('#nextStep'); // 进入下一个步骤

var cancleAnalyse = false; // 是否取消一步分析


var caseInitialST = ''; // 案件不可改变的开始时间
var caseInitialET = ''; // 案件不可改变的结束时间

var caseStartTime = ''; // 案件开始时间
var caseEndTime = ''; // 案件结束时间
var tollgateIds = ''; // 已选卡口，并且用已选的卡口进行了一步或者分步研判


$(function() {
    initDialog();
    initEvent();
});




function initMap(){

    var options = {
        closePopupOnClick: false,//点击地图其它地方是否关闭Popup框
    }

    UI.map.init(options,function(){
        mapObj = UI.map.getMap();
        mapMarkers = L.markerClusterGroup();
        initPersonDetail(); //初始化人员信息
    });
}


function initDialog(){

	debugger
    UI.util.showCommonWindow("/ishare/docs/plugins/dialogCon.html","dialogDemo", 800, 500,
        function(resp){
            alert(resp.join(","));
    });

}
/**
 * @author xlg
 * 渲染当前主步骤
 * endIndex: 当前主步骤
 * oneSubs: 通过点击分步或一步研判
 * oneStep: 一步研判，用于取消一步研判分析
 */
function renderCaseTab(endIndex, oneSubs, oneStep) {
	if(endIndex > maxStep) {
		return;
	}
	curStep = endIndex;

	// 步骤
	$.each(caseTabList, function(index, value) {
		if(index > endIndex) {
			$(this).removeClass('active active-has');
		}else if(index == endIndex) {
			$(this).removeClass('active-has').addClass('active');
		}else{
			$(this).removeClass('active').addClass('active-has');
		}
	})

	// 点击一步或者分步研判
	if(oneSubs) {
		// 每次点击分步或一步研判更新圈选卡口tollgateIds
		tollgateIds = caseAddressBtn.attr('data-value');
		caseStartTime = beginTimeObj.val(); // 更新研判开始时间
		caseEndTime = endTimeObj.val(); // 更新研判结束时间
		// 每次点击分步或一步研判更新msgId
		UI.control.remoteCall('vehicle/token/queryToken', {
			beginTime: caseStartTime,
			endTime: caseEndTime,
			tollgateIds: tollgateIds
		}, function(resp){
			msgId = resp.msgId;
			initThreeTabData();
		}, function(error) {
		});
	}
	// 步骤对应的content
	caseContent.addClass('hide').eq(endIndex).removeClass('hide');
	if(oneOrSubs === true && oneSubs == true) { // 一步研判
		$('#onestepAnalyse').removeClass('hide');
		$('#substepAnalyse').addClass('hide');
		if(oneStep) {
			$('#progressValue').width(0);
			onestepFn();
		}
	}else if(oneSubs == true){ // 分步研判
		$('#substepAnalyse').removeClass('hide');
		$('#onestepAnalyse').addClass('hide');
		// initThreeTabData(); // 第三步数据初始化
	}

	// 只渲染一次地图
	if(!initMapTF) {
		initMapTF = true;
		initMap();
	}
	endIndex <= 0 ? prevStep.addClass('hide') : prevStep.removeClass('hide');
	endIndex >= maxStep ? nextStep.addClass('hide') : nextStep.removeClass('hide'); // 当前步骤小于最大步骤才显示进入下一个步骤

	$('#prevStepNum').text(endIndex);
	$('#nextStepNum').text(parseInt(endIndex) + 2);
	
}



// 模型检索
function doModelSearch() {
	var searchText = $('#searchText').val();
	if(searchText == '') {
		$('.case-item-list').removeClass('hide');
	}
	$('.case-item-list').each(function() {
		var aa = $(this).attr('list-name').indexOf(searchText);
		if($(this).attr('list-name').indexOf(searchText) != -1) {
			$(this).removeClass('hide');
		}else{
			$(this).addClass('hide');
		}
	})
}


// 模型类型
function renderTypeClass(i) {
	var typeClass = ['type-steal', 'type-module', 'type-nature', 'type-area', 'type-yi'];
	return typeClass[i-1];
}

















