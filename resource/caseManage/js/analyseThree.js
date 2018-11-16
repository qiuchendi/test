/**
 * @author xlg
 * @version 2018-07-02
 */

var curAnalyseStep = 0; // 分步研判当前步骤
var maxAnalyseStep = 0; // 分步研判已进入过的最大步骤


var analyseTabList = $('#analyseTabBox .analyse-tab-list'); // 四个步骤
var analyseContent = $('#analyseContentWrap .analyse-step-wrap'); // 四个对应的content tab

var analysePrev = $('#analysePrev'); // 上一步
var analyseNext = $('#analyseNext'); // 下一步
var exportResultBtn = $('#exportResultBtn'); // 输出研判结果

// 查询条件
var historyConditionForm = {}; // 历史过车行为分析
var historyPassForm = {}; // 案发前后过车行为分析
var similarForm = {}; // 相似车分析
var vehicleAutoFileForm = {}; // 车档对比分析
var finalResultForm = {}; // 输出研判结果


// 历史过车行为分析
var nightStartTime = ''; // 夜间开始时间
var nightEndTime = ''; // 夜间结束时间
var daysBeforeCase = ''; // 夜间结束时间
var vehicleTypesStr = ''; // 排查车型

// 案发前后过车行为分析
var hoursBeforeCase = ''; // 案发前小时数
var hoursAfterCase = ''; // 案发后小时数


// 一步研判默认检索条件
var historySetup = {};
var beforeCaseSetup = {};
var similarSetup = {};
var similarSetup = {};


var orgTreeOpts = {
	isShowFolder: true,
	multiple: true,
	dropdownWidth: '100%',
	dropdowndefault: '请选择车辆抓拍机',
	search: {
		enable: true,              //是否启用搜索
		searchTreeNode: true,				//搜索参数 key|value为文本框的ID
		searchTextId: 'deviceNames',
		ignoreEmptySearchText: true,
		searchBtnId: 'searchs'
	},
	parentNodeRender: function(treeNode){
		if(treeNode.IS_ROLE == 'false'){
			treeNode.chkDisabled = true;
		}
		if(!treeNode.hasChildren){
			treeNode =  $.extend(treeNode, {
				text:'<span class="ico-passport-name">'+ treeNode.text+'</span>',
				isParent:false,
			});
		}
		return treeNode;
	}	
};

//初始化下拉选择框
function initTreeEvent(){
    var orgTree = UI.control.getControlById("orgTree");
    orgTree.bindEvent("onDropdownSelect", function(node){
    	var orgCode="";
    	if(node){
    		for(var i=0;i<node.length;i++){
    			if(orgCode===""){
					orgCode=node[i].id;
				}else{
					orgCode=orgCode+","+node[i].id;
				}
    		}
    	}
        $("#orgCode").val(orgCode);
        curOrgCode = orgCode;
    });
    //默认选中所有节点
    orgTree.checkAllNodes(true);
    var allNodeTexts = orgTree.getDropdownSelectTexts().replaceAll('</p>', '');
    $(".tree-title").attr("title", allNodeTexts);
    $(".tree-title").html(allNodeTexts);
    //获取所有节点id(以,分隔)
    var allNodeIds = orgTree.getDropdownSelectIds();
    curOrgCode = allNodeIds;
    
    var id = orgTree.getNodes()[0].id;
    orgTree.setDropdownSelectNode(id);
}


$(function() {
	initTreeEvent();
	initAnalyseThreeEvents();
	oneStepWave(); // 一步渲染动画
})


function initThreeTabData() {

	// 历史过车行为设置初始化
	UI.control.remoteCall('queryCondition/template/getVehicleQueryCondition', {type: 1}, function(resp){

		historySetup = resp.data;

		UI.util.bindForm($('#historyCondition'), resp.data);
		nightStartTime = resp.data.nightStartTime; // 夜间开始时间
		nightEndTime = resp.data.nightEndTime; // 夜间结束时间
		daysBeforeCase = resp.data.daysBeforeCase; // 夜间结束时间

		var vehicleTypes = resp.data.vehicleTypes;
		vehicleTypesStr = resp.data.vehicleTypes; // 排查车型

		UI.control.remoteCall('vehicleDict/getVehicleType', {
			caseStartTime: caseStartTime,
			caseEndTime: caseEndTime,
			tollgateIds: tollgateIds,
			daysBeforeCase: daysBeforeCase
		}, function(resp){
			if(resp.data.length > 0) {
				var vehicleTypeHtml = '<span class="tag-item tag-item-all">全部</span>';
				$.each(resp.data, function(i, o) {
					vehicleTypeHtml += '<span class="tag-item" id="' + o.id + '">' + o.name + '</span>';
				})
				$("#vehicleType").html(vehicleTypeHtml);

				if(vehicleTypes) {
					$('#vehicleType .tag-item').each(function() {
						if(vehicleTypes.indexOf($(this).attr('id')) != -1) {
							$(this).addClass('active');
						}
					})
				}else{
					$('#vehicleType .tag-item-all').addClass('active');
				}
				$('#historyConfirm').click(); // 进入第三步初始化检索
			}
		}, function(error) {
		},{async: true});

	}, function(error) {

	});


	// 案发前后过车行为分析
	UI.control.remoteCall('queryCondition/template/getVehicleQueryCondition', {type: 2}, function(resp){
		if(resp.data) {
			beforeCaseSetup = resp.data;
			hoursBeforeCase = resp.data.hoursBeforeCase; // 案发前小时数
			hoursAfterCase = resp.data.hoursAfterCase; // 案发后小时数
			UI.util.bindForm($('#historyBeforeAfter'), resp.data);
		}
	}, function(error) {
	});

	// 相似车分析
	UI.control.remoteCall('queryCondition/template/getVehicleQueryCondition', {type: 3}, function(resp){
		similarSetup = resp.data;
		similarForm = resp.data;
	}, function(error) {
	});

	
}


function initAnalyseThreeEvents() {

	// 取消分析
	$('#progressCancle').click(function() {
		cancleAnalyse = true;
		renderCaseTab(1);
	})

	// 点击步骤
	$('#analyseTabBox .analyse-tab-list').click(function() {
		var thisStep = $(this).attr('analyseStep');
		// 当前步骤必须小于当前最大步骤才能进入下一步
		if(thisStep > maxAnalyseStep) {
			return;
		}
		renderAnalyseTab(thisStep);
	})

	// 返回步骤
	analysePrev.click(function() {
		renderAnalyseTab(--curAnalyseStep);
	})

	// 进入步骤
	analyseNext.click(function() {
		if(curAnalyseStep >= maxAnalyseStep) {
			maxAnalyseStep++;
		}
		renderAnalyseTab(++curAnalyseStep);
		if(curAnalyseStep == 1) {
			$('#caseBeforeConfirm').click();
		}else if(curAnalyseStep == 2) {
			$('#similarConfirm').click();
		}else if(curAnalyseStep == 3) {
			$('#fakeDeckConfirm').click();
		}
	})
	
	// 历史过车记录次数点击详情
	$('body').on('click', '.frequencyLink', function() {
		var plate = $(this).attr('plate');
		var plateColorClass = $(this).attr('plateColorClass');
		var carLogo = $(this).attr('carLogo');
		var vehicleColor = $(this).attr('vehicleColor');
		var daysBeforeCase = $('#daysBeforeCase').val();
		var frequencyParams = '?plate=' + plate + '&plateColorClass=' + plateColorClass + '&carLogo=' + carLogo + '&vehicleColor=' + vehicleColor + '&daysBeforeCase=' + daysBeforeCase;
		UI.util.openCommonWindow({
			src: '/casedetection/page/case/historyRecords.html' + frequencyParams, 
			title: '历史过车记录', 
			width: $(top.window).width()*.95, 
			height: $(top.window).height()*.95, 
			callback: function(resp){
				
			}
		});
	})

	// 设置
	$('#analyseSetup').click(function() {
		UI.util.openCommonWindow({
			src: '/casedetection/page/case/setup.html?curTab=' + curAnalyseStep, 
			title: '高级设置', 
			width: 600, 
			height: 500, 
			callback: function(resp){
				
			}
		});
	})

	// 相似车分析、车档对比分析 - 详情页面
	$('#similarWrap, #fakeDeckWrap').on('click', '.detailLink', function() {
		var plate = $(this).attr('plate');
		var plateColorClass = $(this).attr('plateColorClass');
		var carLogo = $(this).attr('carLogo');
		var vehicleColor = $(this).attr('vehicleColor');
		var daysBeforeCase = $('#daysBeforeCase').val();
		var showKeySPRecords = $(this).attr('showKeySPRecords'); // 1 车档对比分析页面才显示车档详情和轨迹、频次分析
		var situation = $(this).attr('situation'); // 2 为套牌 1 为假牌
		var detailParams = '?plate=' + plate + '&plateColorClass=' + plateColorClass + '&carLogo=' + carLogo + '&vehicleColor=' + vehicleColor + '&daysBeforeCase=' + daysBeforeCase + '&showKeySPRecords=' + showKeySPRecords + '&situation=' + situation;
		UI.util.openCommonWindow({
			src: '/casedetection/page/case/detail.html' + detailParams, 
			title: '详情', 
			width: $(top.window).width()*.95, 
			height: $(top.window).height()*.95, 
			callback: function(resp){
				
			}
		});
	})


	// 输出研判结果
	exportResultBtn.click(function() {
		maxStep = 3;
		renderCaseTab(3);
		$('#finalResultConfirm').click();
	})


	/* 历史过车行为分析-排查车型 start */ 
 	$('#vehicleType').on('click', '.tag-item', function() {
 		if($(this).hasClass('tag-item-all')) {
 			$(this).addClass('active').siblings().removeClass('active');
 		}else{
 			$('#vehicleType .tag-item-all').removeClass('active');
 			$(this).toggleClass('active');
 		}
 	})
	/* 历史过车行为分析-排查车型 end */ 
	/* 相似车分析-比对条件 start */ 
 	$('#similarComparison').on('click', '.tag-item', function() {
 		if($(this).hasClass('tag-item-all')) {
 			$(this).addClass('active').siblings().removeClass('active');
 		}else{
 			$('#similarComparison .tag-item-all').removeClass('active');
 			$(this).toggleClass('active');
 		}
 	})
	/* 相似车分析-比对条件 end */ 
	
	/* 相似车分析-比对条件 start */ 
 	$('#vehicleAutoFileFD, #finalResultFD').on('click', '.tag-item', function() {
 		$(this).toggleClass('active').siblings().removeClass('active');
 	})
	/* 相似车分析-比对条件 end */ 

	// 历史过车行为分析确认搜索
	$('#historyConfirm').click(function() {
		historyConditionForm = UI.util.formToBean($('#historyCondition'));
		daysBeforeCase = historyConditionForm.daysBeforeCase; // 点击搜索重置historyConditionForm

		historyConditionForm.msgId = msgId; // queryToken msgId
		historyConditionForm.tollgateIds = tollgateIds;
		historyConditionForm.caseStartTime = caseStartTime; // 案件开始时间
		historyConditionForm.caseEndTime = caseEndTime; // 案件结束时间
		historyConditionForm.nightStartTime = nightStartTime; // 夜间开始时间
		historyConditionForm.nightEndTime = nightEndTime; // 夜间结束时间

		var vehicleTypes = [];
		$('#vehicleType .active').each(function() {
			vehicleTypes.push($(this).attr('id'));
		})
		vehicleTypesStr = vehicleTypes.join(',');
		historyConditionForm.vehicleTypes = vehicleTypesStr; // 排查车型

		historyConditionForm.isAsync = true;

		UI.control.getControlById("historicalVehicleList").reloadData(null, historyConditionForm);

	})


	// 案发前后过车行为分析
	$('#caseBeforeConfirm').click(function() {

		historyPassForm = UI.util.formToBean($('#historyBeforeAfter'));
		hoursBeforeCase = historyPassForm.hoursBeforeCase; // 案发前小时数
		hoursAfterCase = historyPassForm.hoursAfterCase; // 案发后小时数
		historyPassForm.msgId = msgId; 
		historyPassForm.detectTollgateIds = $('#orgCode').val();
		historyPassForm.caseStartTime = caseStartTime; // 案件开始时间
		historyPassForm.caseEndTime = caseEndTime; // 案件结束时间
		historyPassForm.isAsync = true;

		UI.control.getControlById("historicalPassList").reloadData(null, historyPassForm);

	})


	// 相似车分析
	$('#similarConfirm').click(function() {

		similarForm.msgId = msgId; // queryToken msgId

		similarForm.caseStartTime = caseStartTime; // 案件开始时间
		similarForm.caseEndTime = caseEndTime; // 案件结束时间

		similarForm.hoursBeforeCase = hoursBeforeCase; // 案发前小时数
		similarForm.hoursAfterCase = hoursAfterCase; // 案发后小时数

		similarForm.vehicleTypes = vehicleTypesStr; // 历史过车行为分析-排查车型

		var similarComparison = [];
		$('#similarComparison .active').each(function() {
			similarComparison.push($(this).attr('id'));
		})
		similarForm.compareCondition = similarComparison.join(',');

		similarForm.isAsync = true;

		UI.control.getControlById("similarList").reloadData(null, similarForm);

	})


	// 车档对比分析
	$('#fakeDeckConfirm').click(function() {
		// vehicleAutoFileForm.msgId = msgId; // queryToken msgId
		// vehicleAutoFileForm.isAsync = true;
		// vehicleAutoFileForm.situation = $('#vehicleAutoFileFD .active').data('id');
		// UI.control.getControlById("vehicleAutoFile").reloadData(null, vehicleAutoFileForm);


		similarForm.msgId = msgId; // queryToken msgId

		similarForm.caseStartTime = caseStartTime; // 案件开始时间
		similarForm.caseEndTime = caseEndTime; // 案件结束时间

		similarForm.hoursBeforeCase = hoursBeforeCase; // 案发前小时数
		similarForm.hoursAfterCase = hoursAfterCase; // 案发后小时数

		similarForm.vehicleTypes = vehicleTypesStr; // 历史过车行为分析-排查车型

		var similarComparison = [];
		$('#similarComparison .active').each(function() {
			similarComparison.push($(this).attr('id'));
		})
		similarForm.compareCondition = similarComparison.join(',');

		similarForm.isAsync = true;

		UI.control.getControlById("vehicleAutoFile").reloadData(null, similarForm);

	})


	// 输出研判结果检索
	$('#finalResultConfirm').click(function() {
		// finalResultForm.msgId = msgId; // queryToken msgId
		// finalResultForm.isAsync = true;
		// finalResultForm.situation = $('#finalResultFD .active').data('id');
		// UI.control.getControlById("caseFinalResult").reloadData(null, finalResultForm);

		similarForm.msgId = msgId; // queryToken msgId

		similarForm.caseStartTime = caseStartTime; // 案件开始时间
		similarForm.caseEndTime = caseEndTime; // 案件结束时间

		similarForm.hoursBeforeCase = hoursBeforeCase; // 案发前小时数
		similarForm.hoursAfterCase = hoursAfterCase; // 案发后小时数

		similarForm.vehicleTypes = vehicleTypesStr; // 历史过车行为分析-排查车型

		var similarComparison = [];
		$('#similarComparison .active').each(function() {
			similarComparison.push($(this).attr('id'));
		})
		similarForm.compareCondition = similarComparison.join(',');

		similarForm.isAsync = true;

		UI.control.getControlById("caseFinalResult").reloadData(null, similarForm);
		
	})


}


// 渲染当前步骤
function renderAnalyseTab(endIndex) {

	curAnalyseStep = endIndex;
	if(curAnalyseStep <= 0) {
		analysePrev.addClass('hide');
		analyseNext.removeClass('hide');
	}else{
		analysePrev.removeClass('hide');
		analyseNext.removeClass('hide');
	}
	if(curAnalyseStep == 3) {
		analysePrev.addClass('hide');
		analyseNext.addClass('hide');
		exportResultBtn.removeClass('hide');
	}else{
		analyseNext.removeClass('hide');
		exportResultBtn.addClass('hide');
	}
	// 步骤
	$.each(analyseTabList, function(index, value) {
		if(index > endIndex) {
			$(this).removeClass('active active-has');
		}else if(index == endIndex) {
			$(this).removeClass('active-has').addClass('active');
		}else{
			$(this).removeClass('active').addClass('active-has');
		}
	})
	// 步骤对应的content
	analyseContent.addClass('hide').eq(endIndex).removeClass('hide');

}



// 一步渲染动画
function oneStepWave() {
	var waveTitleWrap = $('#waveTitleWrap');
	var waveImg = $('#waveImg');
	var rotateAngle = -90;
	var rotateDirection = false;
	setInterval(function() {
		if(rotateAngle >= 180) {
			rotateDirection = false;
		}else if(rotateAngle <= -180) {
			rotateDirection = true;
		}
		if(rotateAngle > 100 || rotateAngle < -100 ) {
			waveTitleWrap.addClass('wave-up').removeClass('wave-down');
		}else if(rotateAngle > -50 && rotateAngle < 50 ) {
			waveTitleWrap.addClass('wave-down').removeClass('wave-up');
		}else{
			waveTitleWrap.removeClass('wave-down wave-up');
		}
		if(rotateDirection) {
			rotateAngle += 4;
		}else{
			rotateAngle -= 4;
		}
		waveImg.css({
			transform: 'rotateX(' + rotateAngle + 'deg) translateX(-50%)'
		})

	}, 100)
}