$(document).ready(function () {
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
		    registerNewUser();
		}
	});

	initialAnimation();
});

function registerNewUser(data) {

    var obj = new Object();
    obj.name = $('.textName').val();
    obj.email = $('.textEmail').val();
    obj.pass = $('.textPass').val();

    hub.server.register(obj).fail(function () {
        validationFailed();
        window.setTimeout(function () {
            window.location.reload();
        }, 3000);
    }).done(function () {
        validationPassed();
        window.setTimeout(function () {
            window.location.replace('/home');
        }, 3000);
    });
}

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