

// 历史过车行为时间
var historyBT = $('#historyBT');
var historyET = $('#historyET');
// 相似车时间
var similarBT = $('#nightStartTime');
var similarET = $('#nightEndTime');

// 当前tab
var curTab = UI.util.getUrlParam('curTab');
var setupTabLi = $('.setup-tab li');


$(function() {
	initEvent();
	initTime();

	initSetUpData();

	// 自动切换tab
	if(curTab == 1) {
		setupTabLi.eq(1).click();
	}else if(curTab == 2) {
		setupTabLi.eq(2).click();
	}

});

function initSetUpData() {

	// 车型
	UI.control.remoteCall('vehicleDict/getVehicleType', {
		caseStartTime: parent.caseStartTime,
		caseEndTime: parent.caseEndTime,
		tollgateIds: parent.tollgateIds,
		daysBeforeCase: parent.daysBeforeCase
	}, function(resp){
		// $("#vehicleType").append(tmpl('vehicleTypeTmpl',resp.data));
		if(resp.data.length > 0) {
			var vehicleTypeHtml = '';
			$.each(resp.data, function(i, o) {
				vehicleTypeHtml += '<span class="v-tag-item"><input type="checkbox" name="" id="' + o.id + '"><label for="' + o.id + '">' + o.name + '</label></span>';
			})
			$("#vehicleType").append(vehicleTypeHtml);

			// 历史过车行为
			UI.control.remoteCall('queryCondition/template/getVehicleQueryCondition', {type: 1}, function(resp){
				UI.util.bindForm($('#setupHistory'), resp.data);
				$('#vehicleType input').each(function() {
					if(resp.data.vehicleTypes.indexOf($(this).attr('id')) != -1) {
						$(this).prop('checked', true);
					}
				})
			}, function(error) {

			},{async: true});

		}
	}, function(error) {
	},{async: true});

	// 案发前后过车行为
	UI.control.remoteCall('queryCondition/template/getVehicleQueryCondition', {type: 2}, function(resp){
		if(resp.data) {
			UI.util.bindForm($('#setupCaseBefore'), resp.data);
		}
	}, function(error) {
	},{async: true});

	// 相似车
	UI.control.remoteCall('queryCondition/template/getVehicleQueryCondition', {type: 3}, function(resp){
		if(resp.data) {
			UI.util.bindForm($('#setupSimilar'), resp.data);
		}
	}, function(error) {
	},{async: true});

}


function initEvent() {
	// tab 切换
	setupTabLi.click(function() {
		uiTipsClose(); // 关闭提示
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		$('.searchTermsWrap').addClass('hide');
		$('#' + $(this).attr('ref')).removeClass('hide');
	})

	// 确认
	$('#windowConfirm').click(function() {

		if(UI.util.validateForm($('#setupTabContent'))) {
			UI.util.showLoadingPanel();
			var vehicleTypeIds = [];
			$('#vehicleType input:checked').each(function() {
				vehicleTypeIds.push($(this).attr('id'));
			})
			// 历史过车行为
			var setupHistoryFormData = UI.util.formToBean($('#setupHistory'));
			setupHistoryFormData.vehicleType = vehicleTypeIds.join(',');
			UI.control.remoteCall('queryCondition/template/saveOrUpdateHistoricalVehicleQueryCondition', setupHistoryFormData, function(resp){
				if(resp.message === '保存成功') {
					UI.util.alert(resp.message, 'warm');
				}
			}, function(error) {
			});
			// 案发前后过车行为
			var beforeCaseFormData = UI.util.formToBean($('#setupCaseBefore'));
			UI.control.remoteCall('queryCondition/template/saveOrUpdateBeforeAfterCaseQueryCondition', beforeCaseFormData, function(resp){
				if(resp.message === '保存成功') {
					UI.util.alert(resp.message, 'warm');
				}
			}, function(error) {
			});
			// 相似车
			var similarFormData = UI.util.formToBean($('#setupSimilar'));
			UI.control.remoteCall('queryCondition/template/saveOrUpdateSimilarVehicleQueryCondition', similarFormData, function(resp){
				if(resp.message === '保存成功') {
					UI.util.alert(resp.message, 'warm');
				}
				UI.util.hideLoadingPanel();
				parent.UI.util.closeCommonWindow();
			}, function(error) {
				UI.util.hideLoadingPanel();
			});
		}

		// parent.UI.util.returnCommonWindow({
		// 	confirm: true
		// });

	})
	// 取消、关闭
	$('#windowCancle').click(function() {
		parent.UI.util.closeCommonWindow();
	})

}



function initTime() {
	// 历史过车行为时间
	historyBT.val('19:00:00');
	historyET.val('22:00:00');
	historyBT.focus(function(){
		WdatePicker({
			startDate:'%H:%m:%s',
			dateFmt:'HH:mm:ss'
		});
		
	});
	historyET.focus(function(){
		WdatePicker({
			startDate:'%H:%m:%s',
			dateFmt:'HH:mm:ss'
		});
		
	});

	// 相似车时间
	similarBT.val('19:00:00');
	similarET.val('22:00:00');
	similarBT.focus(function(){
		WdatePicker({
			startDate:'%H:%m:%s',
			dateFmt:'HH:mm:ss'
		});
		
	});
	similarET.focus(function(){
		WdatePicker({
			startDate:'%H:%m:%s',
			dateFmt:'HH:mm:ss'
		});
		
	});

}