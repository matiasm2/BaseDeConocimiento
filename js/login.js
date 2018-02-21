$(document).ready(function() {


	//Habilita la consola en iexplorer
	if ( ! window.console ) console = { log: function(){} };
	String.prototype.format = function() {
		var s = this,
		i = arguments.length;
		while (i--) {
			s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
		}
		return s;
    };

	var baseURL = '{0}//{1}'.format(window.location.protocol, window.location.host); // Build the base URL from address bar

	$('#bt-logout').hide();

	//
	if (typeof(Storage) !== "undefined") {
		if (localStorage.sessionToken) {
			window.location=baseURL+'/nuevoregistro.html';
			$('#login').hide();
			$('#bt-logout').show();

		}
	} else {
		alert('There is not support for LocalStorage');
	}

    $('#submit').click(function(){
      //username = $('#username').val();
      //password = $('#password').val();
	  //sessionToken = generarSessionToken(username, password, 'DEV');
	  //sessionToken = createUserSessionFromInstance(username, password, 'DEV');
	  //sessionToken = createDomainUserSessionFromInstance($('#username').val(), $('#password').val(), 'PROD', 'ARG');
		sessionToken = createUserSessionFromInstance($('#username').val(), $('#password').val(), 'PROD');

      //console.log('Usuario: ' + username);
      //console.log('Contraseña: '+password);
      //console.log('SessionToken: '+sessionToken);

	  if (sessionToken){
		   localStorage.sessionToken = sessionToken;
		   window.location=baseURL+'/nuevoregistro.html';
	  }
    });

	$('#bt-logout').click(function(){
		localStorage.removeItem("sessionToken");
		$('#login').show();
		$('#bt-logout').hide()
    });

});

function createUserSessionFromInstance (username, password, instancename){
	var sessionToken;
	$.soap({
		url: location.protocol+'//172.16.1.52/ws/general.asmx',
		//url: 'http://172.16.1.52/ws/general.asmx',
		method: 'CreateUserSessionFromInstance',
		SOAPAction: 'http://archer-tech.com/webservices/CreateUserSessionFromInstance',
		namespaceURL: 'http://archer-tech.com/webservices/',
		appendMethodToURL: false,
		async: false,
		data: {
			userName: username,
			password: password,
			instanceName: instancename
		},
		success: function (soapResponse) {
			console.log('Ok');
			sessionToken = soapResponse.content.firstChild.textContent;
			$('#bt-logout').show();
			$('#login').hide();
		},
		error: function (soapResponse) {
			console.log('Error');
			console.log(soapResponse);
			if(soapResponse.content && soapResponse.content.firstChild){alert(soapResponse.content.firstChild.textContent)}
			if (soapResponse.httpText=="NetworkError: Failed to execute 'send' on 'XMLHttpRequest': Failed to load 'https://172.16.1.52/ws/general.asmx'."){
				alert("Por favor, concedanos permiso para ingresar al siguiente sitio:")
				var win =  window.open("https://172.16.1.52/", "_blank", "height=600,width=600,modal=yes,alwaysRaised=yes");
				var timer = setInterval(function() {   
					if(win.closed) {  
						clearInterval(timer);  
						window.location.reload();
					}  
				}, 1000); 
							}

		}
	});

	return sessionToken;
}

function createDomainUserSessionFromInstance (username, password, instancename, usersDomain){
	var sessionToken;
	$.soap({
		url: location.protocol+'//172.16.1.52/ws/general.asmx',
		//url: 'https://arsvarcher/ws/general.asmx',
		method: 'CreateDomainUserSessionFromInstance',
		SOAPAction: 'http://archer-tech.com/webservices/CreateDomainUserSessionFromInstance',
		namespaceURL: 'http://archer-tech.com/webservices/',
		appendMethodToURL: false,
		async: false,
		data: {
			userName: username,
			password: password,
			instanceName: instancename,
			usersDomain: usersDomain
		},
		success: function (soapResponse) {
			console.log('Ok');
			sessionToken = soapResponse.content.firstChild.textContent;
			console.log(sessionToken);
			$('#bt-logout').show();
			$('#login').hide();
		},
		error: function (soapResponse) {
			console.log('Error');
			console.log(soapResponse);
			if(soapResponse.content.firstChild){alert(soapResponse.content.firstChild.textContent)}

		}
	});

	return sessionToken;
}
