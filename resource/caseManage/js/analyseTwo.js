/**
 * @author xlg
 * @version 2018-07-02
 */


// 地图圈选对象保存
var map = null;
var layer = null;  // 点
var circle = null; // 框
var eMap = null;
var latlng = null;
var wfs = null;


var caseAddressBtn = $('#caseAddressBtn'); // 标注案发地点按钮
var caseRange = $('#caseRange'); // 案发地点半径范围

// 研判条件
var beginTimeObj = $('#beginTime'); // 统计起始时间
var	endTimeObj = $('#endTime'); // 统计终止时间
var importParams = {};

var msgId = ''; // 请求唯一标识,以此标识可以贯穿一次分析模型的多个步骤

$(function() {
	// initTwoTabData();
	initAnalyseTwoEvents();
})


// function initTwoTabData() {}

function initAnalyseTwoEvents() {

	// 分步研判
	$('#substep').click(function(){
		if(initQueryParams()) {
			if(maxStep <= 1) {
				maxStep++;
			}
			oneOrSubs = false;
			maxStep = 2;
			renderCaseTab(2, true);
			maxAnalyseStep = 0;
			renderAnalyseTab(0);
		}
	})
	// 一步智能研判
	$('#onestep').click(function(){
		if(initQueryParams()) {
			if(maxStep <= 1) {
				maxStep++;
			}
			oneOrSubs = true;
			maxStep = 2;
			renderCaseTab(2, true, true);
		}
	}) 


	// 标注案发地点
	caseAddressBtn.click(function() {
		var $this = $(this);
		$this.attr('data-value', '');
		$this.attr('data-num', '');
		var caseRangeValue = caseRange.val();
		caseRangeValue = parseInt(caseRangeValue) * 1000;
		drawCircle(caseRangeValue, function(resp) {
			returnCircleResult(resp, $this);
		});
	})
	// 半径改变触发标注案发地点
	caseRange.keypress(function(e) {
		if(((e.keyCode || e.which) == 13)) {
			if(circle) {
				var radius = $(this).val();
				radius = parseInt(radius) * 1000;
				circle.setRadius(radius);
		        wfs.setLayer("L_TOLLGATE").setGeometry(circle).run(function(resp) {
		        	returnCircleResult(resp, caseAddressBtn);
				});  
			}
		}
	});


	// 查看统计
	$('#viewStatistics').click(function(){
		if(initQueryParams()) {

			// 固定卡口数
			$('#tollgateIdsCount').text(caseAddressBtn.attr('data-num'));
			$('#importStatistics').removeClass('hide');

			// 横向柱状图
			UI.control.remoteCall('vehicle/stat/vehicleSourceLocationStat', importParams, function(resp){
				if(resp.data) {
					var progressHtml = '';
					var i = 0;
					$.each(resp.data, function(k, v) {
						if(i < 10) {
							progressHtml += '<li><span>' + k + '市</span><p class="pl-progress" data-progress="' + v + '"></p>' + v + '</li>';
							i++;
						}else{
							return false;
						}
					})
					$('#progressList').html(progressHtml);
					if(resp.count > 0) {
						$('.pl-progress').each(function() {
							UI.util.progressbar({elem:$(this)}).setValue(parseInt($(this).data('progress')*100/resp.count));
						})
					}else{
						UI.util.progressbar({elem:$(".pl-progress")}).setValue(0);
					}
				}
			}, function(error) {
			},{async: true});
			
			// 饼状图
			UI.control.remoteCall('vehicle/stat/vehicleTypeStat', importParams, function(resp){
				var vehicleTypeStat = [];
				if(resp.data) {
					$.each(resp.data, function(k, v) {
						vehicleTypeStat.push({
							name: k,
							value: v	
						})
					})
				}
				vehiclePieInit(vehicleTypeStat);

			}, function(error) {
			},{async: true});


			// 过车量
			UI.control.remoteCall('vehicle/stat/vehicleCount', importParams, function(resp){
				$('#vehicleCount').text(resp.data.vehicleCount);
			}, function(error) {
			},{async: true});

		}
	})
	// 关闭统计
	$('#statisticsClose').click(function() {
		$('#importStatistics').addClass('hide');
	})


}




// 研判条件表单验证
function initQueryParams() {
	if (UI.util.validateForm($('#studyDetermine'), true)){
		var selectedTollgateIds = caseAddressBtn.attr('data-value');
		if(selectedTollgateIds) {
			importParams = {
				beginTime: $('#beginTime').val(), // 统计开始时间
				endTime: $('#endTime').val(), // 统计结束时间
				tollgateIds: selectedTollgateIds
				// tollgateIds: '440114724127002001'
			}
			return true;
		}else{
			UI.util.alert('案发地点附近卡口不能为空！', 'warm');
			return false;
		}
	}else{
		return false;
	}
}


// 查看统计
function vehiclePieInit(vehicleTypeStat) {
	var vehiclePie = document.getElementById("vehiclePie");
	var myChart = echarts.init(vehiclePie);
	var option = {
	    series : [{
	        type: 'pie',
	        radius : '65%',
	        center: ['50%', '50%'],
	        selectedMode: 'single',
	        legendHoverLink: false,
	        hoverAnimation: false,
	        data: vehicleTypeStat
	    }],
	    color:['#5a6ae9', '#40a5f1','#38cfeb', '#56d19f', '#abe532', '#e7cf12', '#e79512', '#e75e2a', '#e564c3', '#5c4ccd']
	};
	myChart.setOption(option, true);
}



// 标注案发地点
function drawCircle(radius,callback){
    map = UI.map.getMap();
    UI.map.initDrawQuery('L_TOLLGATE',"NAME","geom");
    if(layer) {
        layer.remove();
        circle.remove();
    }
    eMap = map.drawHandler.draw("point",{drawOnce:true});
    eMap.on("drawEnd",function(){
        layer = eMap.layer;
        latlng = eMap.layer.getLatLng();
        circle = L.circle(latlng,{radius:radius}).addTo(map);
        wfs = L.wfsClient(UI.map.getServer() + '/wfs',{geometryField:"geom"});
        wfs.setLayer("L_TOLLGATE").setGeometry(circle).run(callback);        
    });
}

// 卡口圈选回填
function returnCircleResult(respData, $this) {
	if(respData.features.length > 0) {
		var tollgateIdsDC = [];
		$.each(respData.features, function(index, objValue) {
			tollgateIdsDC.push(objValue.properties.KKBH);
		})
		$this.attr('data-value', tollgateIdsDC.join(','));
		$this.attr('data-num', respData.totalFeatures);
	}
}


//初始化日期选择框
function initTime(){
	var	now = new Date();
    // beginTimeObj.val(now.format("yyyy-MM-dd 00:00:00"));
	// endTimeObj.val(now.format("yyyy-MM-dd 23:59:59"));

	// 默认时间为案件开始、结束时间
	beginTimeObj.val(caseStartTime);
	endTimeObj.val(caseEndTime);

    var maxTime , endTime = '';
    maxTime = endTime = now.format("yyyy-MM-dd 23:59:59");

    beginTimeObj.focus(function(){
        WdatePicker({
            startDate:'%y-#{%M}-%d %H:%m:%s',
            dateFmt:'yyyy-MM-dd HH:mm:ss',
            maxDate: endTime,
            onpicked:function(){
            	  now = new Date();
                  maxTime = now.format("yyyy-MM-dd 23:59:59");
            }
        });
    });
	endTimeObj.focus(function(){
        WdatePicker({
            startDate:'%y-#{%M}-%d 23:59:59',
            dateFmt:'yyyy-MM-dd HH:mm:ss',
            minDate:'#F{$dp.$D(\'beginTime\')}',
            maxDate: maxTime
        });
    });
}


// 一步研判
var progressValue = $('#progressValue');
var progressNum = $('#progressNum');
var interval = null;
function onestepFn() {
	cancleAnalyse = false; // 重置取消一步研判的判断
	progressValue.animate({
		width: '15%'
	}, 1000);
	setTimer(5, 15);
	historySetup.msgId = msgId; 
	historySetup.tollgateIds = tollgateIds;
	historySetup.caseStartTime = caseStartTime; // 案件开始时间
	historySetup.caseEndTime = caseEndTime; // 案件结束时间


	UI.control.remoteCall('vehicle/analysis/historicalVehicleList', historySetup, function(resp){
		beforeCaseSetup.msgId = msgId; // queryToken msgId
		beforeCaseSetup.caseStartTime = caseStartTime; // 案件开始时间
		beforeCaseSetup.caseEndTime = caseEndTime; // 案件结束时间
		if(cancleAnalyse) {
			return;
		}
		clearInterval(interval);
		setTimer(15, 25);
		progressValue.animate({
			width: '25%'
		}, 1000, oneStepTwo)
	}, function(error) {
	}, {async: true});



}
// 进度条对应的数字
function setTimer(currentPercent,  maxPercent, spaceTime) {
	spaceTime = spaceTime || 100;
	interval = setInterval(increment,spaceTime);
	var current = currentPercent;
	function increment(){
		current++;
		$('#progressNum').html(current+'%'); 
		if(current >= maxPercent) { 
			clearInterval(interval);
		}
	}
}
// 2
function oneStepTwo() {
	UI.control.remoteCall('vehicle/analysis/beforeAfterCaseVehicleList', beforeCaseSetup, function(resp){
		similarSetup.msgId = msgId; // queryToken msgId
		similarSetup.caseStartTime = caseStartTime; // 案件开始时间
		similarSetup.caseEndTime = caseEndTime; // 案件结束时间
		similarSetup.vehicleTypes = historySetup.vehicleTypes; // 案件结束时间
		similarSetup.hoursBeforeCase = beforeCaseSetup.hoursBeforeCase; // 案件结束时间
		similarSetup.hoursAfterCase = beforeCaseSetup.hoursAfterCase; // 案件结束时间
		if(cancleAnalyse) {
			return;
		}
		clearInterval(interval);
		setTimer(25, 50, 40);
		progressValue.animate({
			width: '50%'
		}, 1000, oneStepThree)
	}, function(error) {
	}, {async: true});
}
// 3
function oneStepThree() {
	similarSetup.nightStartTime = nightStartTime;
	similarSetup.nightEndTime = nightEndTime;
	UI.control.remoteCall('vehicle/analysis/similarVehicleAnalysis', similarSetup, function(resp){
		if(cancleAnalyse) {
			return;
		}
		clearInterval(interval);
		setTimer(50, 75, 40);
		progressValue.animate({
			width: '75%'
		}, 1000, oneStepFour)

	}, function(error) {
	}, {async: true});
}

// 4
function oneStepFour() {
	// UI.control.remoteCall('vehicle/analysis/fakeVehicleAnalysis', {
	// 	msgId: msgId
	// }, function(resp){
	UI.control.remoteCall('vehicle/analysis/similarVehicleAnalysis', similarSetup, function(resp){

		if(cancleAnalyse) {
			return;
		}
		clearInterval(interval);
		setTimer(75, 100, 40);
		progressValue.animate({
			width: '96%'
		}, 1000 ,function() {
			progressNum.html(100+'%');
			$('#analyseProgress').text('分析完成');
			if(!cancleAnalyse) {
				setTimeout(function() {
					maxStep = 3;
					renderCaseTab(3);
					$('#finalResultConfirm').click();
				}, 50)
			}
		})
	}, function(error) {
	}, {async: true});
}

