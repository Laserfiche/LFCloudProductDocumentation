
$(document).ready(function appendUrlToFeedbackButtons()
	{
		var feedbackButtons = document.getElementsByClassName('Button1');
		for (var i = 0; i < feedbackButtons.length; ++i)
			{
		feedbackButtons[i].href += window.location.href;
	}
})();