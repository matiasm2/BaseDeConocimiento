var urls = {
			"baseURL": '',
			"restLogin": 'https://10.100.107.90:8088/https://172.16.1.52/api/core/security/login'
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
});

function postAPICall(array){
	restAPICall = content;
	response = '';

	$.ajax({
			 type: "POST",
			 url: array[0].url,
			 headers: array[0].headers,
			 data: JSON.stringify(array[1]),
			 contentType: 'application/json',
			 processData: false,
			 async: false,
			 dataType: 'json',
			 success: function(data, textStatus, jqXHR) {
				 console.log(data);
				 response = data;
			},
			error: function(jqXHR, textStatus, errorThorwn) {
						console.log(jqXHR);
						console.log(('Ocurrio un error al llamar a la API: ' + textStatus));
						console.log(errorThorwn);
			}

	});

	return response
}

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

	return response;
}

function getSessionArrayREST(username, password, instancename, usersdomain){
	headers = {
		url: urls.restLogin,
		headers: {
			'Accept':'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'Authorization':'Archer session-id='+localStorage.sessionToken,
			'Content-Type': 'application/json'
		}
	}

	data = {
		"InstanceName":instancename,
		"Username":username,
		"UserDomain":usersdomain,
		"Password":password
	}

	return [headers, data]
}

function getDomainSessionArray(username, password, instancename, usersDomain){
	headers = {
		url: location.protocol+'//172.16.1.52/ws/general.asmx',
		method: 'CreateDomainUserSessionFromInstance',
		SOAPAction: 'http://archer-tech.com/webservices/CreateDomainUserSessionFromInstance',
		namespaceURL: 'http://archer-tech.com/webservices/'
	}

	data = {
		userName: username,
		password: password,
		instanceName: instancename,
		usersDomain: usersDomain
	}

	return [headers, data]
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
