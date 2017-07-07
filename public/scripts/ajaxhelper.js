function gPost(action, param, callback, failCallback) {
	$.ajax({
		url : action,
		type : 'post',
		dataType : 'json',
		data : param
	}).done(
			function(response) {
				if (callback) {
					callback(response);
				}
			}
	).fail(
			function(jqXHR, textStatus, errorThrown){
				var response = JSON.parse(jqXHR.responseText);
				var error = response.error;
				if( failCallback ){
					failCallback(error);
				}else{
					alert(error);
				}

			}
	);

}
