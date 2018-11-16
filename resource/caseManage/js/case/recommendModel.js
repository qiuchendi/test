


$(function() {
	initEvent();
	// MoveTab(moveTabList);
	startBallTagRoll()
})


function initEvent() {
	$('#recommendYes').click(function() {
		parent.UI.util.returnCommonWindow({
			recommend: true
		});
		parent.UI.util.closeCommonWindow();
	})
	$('#recommendNo').click(function() {
		parent.UI.util.closeCommonWindow();
	})
}