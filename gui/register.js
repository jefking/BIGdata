$( document ).ready(function() {
	$('.input input').keypress(function(e){
		if (e.keyCode == 13) {
	        $('#start').trigger('click');
	    }
	});
	$('#pass').click(validationPassed);
	$('#fail').click(validationFailed);
	$('#start').click(function(){
		var error = false;

		$('#input-box label').removeClass('error');
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

function validEmail(e) {
    var filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
    return String(e).search (filter) != -1;
}