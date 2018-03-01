var urls = {
			"baseURL": ''
	}
$(document).ready(function() {
	if ( ! window.console ) console = { log: function(){} };
	String.prototype.format = function() {
		var s = this,
		i = arguments.length;
		while (i--) {
			s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
		}
		return s;
    };

	urls.baseURL = '{0}//{1}'.format(window.location.protocol, window.location.host);

	if (typeof(Storage) !== "undefined") {
		if (localStorage.sessionToken) {
			window.location=urls.baseURL+'/nuevoregistro.html';
		}
	} else {
		alert('There is not support for LocalStorage');
	}

    $('#submit').click(function(){
			sessionToken = '';
			response = soapAPICall(getSessionArray($('#username').val(), $('#password').val(), 'PROD'));
			sessionToken = response.content.firstChild.textContent;
			if (sessionToken){
				 localStorage.sessionToken = sessionToken;
				 window.location=urls.baseURL+'/nuevoregistro.html';
			}
    });
});

function soapAPICall(array){
	var response = '';

	$.soap({
		url: array[0].url,
		method: array[0].method,
		SOAPAction: array[0].SOAPAction,
		namespaceURL: array[0].namespaceURL,
		appendMethodToURL: false,
		async: false,

		data: array[1],

		success: function (soapResponse) {
				response = soapResponse;
		},
		error: function (SOAPResponse) {
			console.log('Error');
			console.log(SOAPResponse);
			alert('Ha ocurrido un error al crear un registro: \n'+SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML);
		}
	});

	return response
}

function getSessionArray(username, password, instancename){
	headers = {
		url: location.protocol+'//172.16.1.52/ws/general.asmx',
		method: 'CreateUserSessionFromInstance',
		SOAPAction: 'http://archer-tech.com/webservices/CreateUserSessionFromInstance',
		namespaceURL: 'http://archer-tech.com/webservices/',
	}

	data = {
		userName: username,
		password: password,
		instanceName: instancename
	}

	return [headers, data]
}
