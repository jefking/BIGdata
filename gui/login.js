$( document ).ready(function() {
	$('#pass').click(validationPassed);
	$('#fail').click(validationFailed);
	$('#start').click(initialAnimation);
	initialAnimation();
});

function validationPassed() {
	$('#input-box').fadeOut(200);
	$('#output-pass').delay(200).fadeIn(400);
}

function validationFailed() {
	$('#input-box').fadeOut(200);
	$('#output-fail').delay(200).fadeIn(400);
}

function initialAnimation() {
	$('#output-pass').hide();
	$('#output-fail').hide();
	$('#input-box').fadeIn(400);
}