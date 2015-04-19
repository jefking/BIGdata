$( document ).ready(function() {
	$('#register-input-box input').keypress(function(e){
		if (e.keyCode == 13) {
	        $('#start').trigger('click');
	    }
	});
	$('#pass').click(validationPassed);
	$('#fail').click(validationFailed);
	$('#start').click(function(){
		var error = false;

		$('#register-input-box  label').removeClass('error');
		if($('.textName').val() == ''){
			$('.textName').parent().addClass('error');
			error = true;
		}
		if(!validEmail($('.textEmail').val())){
			$('.textEmail').parent().addClass('error');
			error = true;
		}
		if($('.textPass').val() == ''){
			$('.textPass').parent().addClass('error');
			error = true;
		}
		if(error == true){
			return false;
		} else{
			validationPassed();
		}
	});

	initialAnimation();
});

function validationPassed() {
	$('#register-input-box ').fadeOut(200);
	$('#output-pass').delay(200).fadeIn(400);
}

function validationFailed() {
	$('#register-input-box ').fadeOut(200);
	$('#output-fail').delay(200).fadeIn(400);
}

function initialAnimation() {
	$('#output-pass').hide();
	$('#output-fail').hide();
	$('#register-input-box').fadeIn(400);
}

function validEmail(e) {
    var filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
    return String(e).search (filter) != -1;
}