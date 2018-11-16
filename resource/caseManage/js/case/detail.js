/**
 * @author xlg
 * @version 2018-07-02
 * @description 相似车分析、重点车辆分析详情
 */

var plate = UI.util.getUrlParam("plate")||"";
var plateColorClass = UI.util.getUrlParam("plateColorClass")||"";
var carLogo = UI.util.getUrlParam("carLogo")||"";
var vehicleColor = UI.util.getUrlParam("vehicleColor")||"";

// 相似车分析详情不显示重点嫌疑车辆
var showKeySPRecords = UI.util.getUrlParam("showKeySPRecords")||"";
// 假牌不显示车牌详情按钮
var situation = UI.util.getUrlParam("situation")||"";

var msgId = parent.msgId; 
var parentTollgateIds = parent.tollgateIds; // 卡口

var similarForm = {
	caseStartTime: parent.caseStartTime,
	caseEndTime: parent.caseEndTime,
	hoursBeforeCase: parent.hoursBeforeCase,
	hoursAfterCase: parent.hoursAfterCase,
	msgId: parent.msgId,
	tollgateIds: parentTollgateIds,
	plateInfo: plate
};


$(function() {
	initData();
	initEvent();
})

function initData() {

	$('#plateAndColor').addClass(plateColorClass).text(plate);
	$('#carLogo').text(carLogo);
	$('#vehicleColor').text(vehicleColor);

	// 案发过车记录
	UI.control.remoteCall('vehicle/analysis/similarVehicleDetail', similarForm, function(resp){

		// 案发过车记录
		$('#caseIngRecordsNum').text('(' + resp.vehicleList.length + ')');
		$("#caseIngRecords").html(tmpl('caseIngRecordsTmpl',resp.vehicleList));

		// 案发前后首次和末次过车记录
		$("#caseBFRecords").html(tmpl('caseBFRecordsTmpl',resp.caseBeforeAfterVehicleList));

		// 重点嫌疑车辆
		$("#keySPRecords").html(tmpl('keySPRecordsTmpl',resp.keySuspicionVehicleList));

		// 上游相似车
		$('#upStreamNum').text('(' + resp.similarVehicle.upStreamVehicle.length + ')');
		$("#upStream").html(tmpl('upStreamTmpl',resp.similarVehicle.upStreamVehicle));

		// 下游相似车
		$('#downStreamNum').text('(' + resp.similarVehicle.downStreamVehicle.length + ')');
		$("#downStream").html(tmpl('downStreamTmpl',resp.similarVehicle.downStreamVehicle));
		// 相似车详情不显示重点嫌疑车辆和车档详情、轨迹、频次分析链接跳转
		if(showKeySPRecords == 1) {
			$('#showKeySPRecords, #keySPRecords, .hideDetailTrackFrequency').removeClass('hide');
			$('#vehicleType_li').removeClass("hide");
			if(situation != 2) {
				$('.truePlate').addClass('hide');
			}
		}

		// 初始化判断是否显示更多icon btn
		// $('.upDownMoreWrap').each(function() {
		// 	if($(this).height() > 571) {
		// 		$(this).prev().find('.upDownMore').removeClass('hide');
		// 	}
		// })

	}, function(error) {
	},{async: true});
	
	UI.control.remoteCall('vehicle/analysis/getFakeOrCloneVehicles', similarForm, function(resp){
		var situation = JSON.parse(resp.getFakeOrCloneVehicles).info.situation;
		var carType = "";
		if(situation==2){
			carType = "套牌车";
		}else{
			carType = "假牌车";
		}
		$("#vehicleType").html(carType);
	}, function(error) {
		
	},{async: true});

	

}

function initEvent() {

	// 列表的收起或展开
	$('.triangleClick').click(function() {
		$(this).toggleClass('triangle-down triangle-up');
		$('#' + $(this).attr('ref')).toggleClass('hide');
	})

	// 真牌车档详情
	$('body').on('click', '.truePlate', function() {
		UI.util.openCommonWindow({
			src: '/casedetection/page/case/truePlateDetail.html?plate=' + $(this).attr('plate') + '&msgId=' + msgId, 
			title: '机动车信息', 
			width: $(top.window).width()*.95, 
			height: $(top.window).height()*.95, 
			callback: function(resp){
				
			}
		});
	})

	// 轨迹分析
	$('body').on('click', '.trackAnalyse', function() {
		UI.util.openCommonWindow({
			src: '/casedetection/page/tacticsFrameJs.html?pageUrl=/casedetection/page/technicalStation/trackAnalyse.html&' + returnParams($(this)), 
			title: '轨迹分析', 
			width: $(top.window).width()*.95, 
			height: $(top.window).height()*.95, 
			callback: function(resp){
				
			}
		});
	})

	// 频次分析bodyClass=width210&
	$('body').on('click', '.frequencyAnalyse', function() {
		UI.util.openCommonWindow({
			src: '/casedetection/page/tacticsFrameJs.html?pageUrl=/casedetection/page/technicalStation/frequencyAnalyse.html&' + returnParams($(this)), 
			title: '频次分析', 
			width: $(top.window).width()*.95, 
			height: $(top.window).height()*.95, 
			callback: function(resp){
				
			}
		});
	})

	// 点击显示更多
	$('.upDownMore').click(function() {
		$(this).toggleClass('active');
		$('#' + $(this).attr('ref')).toggleClass('updown-max-height');
	})


}

// 轨迹频次分析传参
function returnParams($this) {
	var plate = $this.attr('plate');
	var carLogo = $this.attr('carLogo');
	var plateColorClass = $this.attr('plateColorClass');
	var trackFrequencyParams = 'beginTime=' + getBeforeOrAfterHours(parent.caseStartTime, parent.hoursBeforeCase, '-') + '&endTime=' + getBeforeOrAfterHours(parent.caseEndTime, parent.hoursAfterCase, '+') + '&plate=' + plate + '&carLogo=' + carLogo + '&plateColorClass=' + plateColorClass;
	return trackFrequencyParams;
} 