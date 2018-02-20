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
	  sessionToken = createUserSessionFromInstance($('#username').val(), $('#password').val(), 'DEV');
	  
      //console.log('Usuario: ' + username);
      //console.log('Contraseña: '+password);
      //console.log('SessionToken: '+sessionToken);
	  
	  if (sessionToken){
		   localStorage.sessionToken = sessionToken;
		   window.location=baseURL+'/nuevoregistro.html';;
	  }
    });
	
	$('#bt-logout').click(function(){
		localStorage.removeItem("sessionToken");
		$('#login').show();
		$('#bt-logout').hide()
    });

});

function generarSessionToken (usuario, contrasena, instancia){
	var sessionToken;
	var baseURL = 'https://localhost';
	var restAPICall = {"InstanceName":instancia, "Username":usuario, "UserDomain":"", "Password":contrasena};

	$.ajax({
		 type: "POST",
		 url: baseURL+'/api/core/security/login',
		 data: JSON.stringify(restAPICall),
		 contentType: 'application/json',
		 processData: false,
		 async: false,
		 dataType: 'json',
		 success: function(data, textStatus, jqXHR) {
		   sessionToken = data.RequestedObject.SessionToken;
		   $('#bt-logout').show();
		   $('#login').hide();
		},
		error: function(jqXHR, textStatus, errorThorwn) {
			if (debugging) {
			  console.log(jqXHR);
			  console.log(('!! Problem executing data feed: ' + textStatus));
			  console.log(errorThorwn);
			}
		}

	});

        return sessionToken;
}

function createUserSessionFromInstance (username, password, instancename){
	var sessionToken;
	$.soap({
		url: 'https://10.100.107.90/ws/general.asmx',
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