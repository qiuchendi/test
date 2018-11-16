/**
 * @Author xlg
 * @version 2018-07-10
 * @description 车牌详情
 */

var plate = UI.util.getUrlParam("plate")||"";
var msgId = UI.util.getUrlParam("msgId")||"";

$(function() {
	initData();
})


function initData() {

	UI.control.remoteCall('vehicle/file/query', {
		msgId: msgId,
		plate: plate
	}, function(resp){
		$('#truePlateDetail').html(tmpl('truePlateDetailTmpl', resp.data.file))

	}, function(error) {

	}, {async: true});

}