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
	

	//
	if (typeof(Storage) !== "undefined") {
		if (!localStorage.sessionToken) {
			window.location=baseURL+'/index.html';
		} else{
			var apps = getAllAplications(localStorage.sessionToken);
			console.log(apps);
			if(apps){
				//loadDoc();
				apps.forEach(function(item){
					//console.log(item);
					//console.log(item.RequestedObject);
					app = '<tr>';
					app += '<td scope="row">'+item.RequestedObject.Name+'</td>';
					app += '<td>'+item.RequestedObject.Alias+'</td>';
					app += '<td>'+item.RequestedObject.ASOName+'</td>';
					app += '<td>'+item.RequestedObject.Description+'</td>';
					app += '</tr>';
					$(app).appendTo('#tbody-tabla');
					//fieldDefinition(localStorage.sessionToken, item.RequestedObject.Id);
					//executeQuickSearchWithModuleIds(localStorage.sessionToken, item.RequestedObject.Id,"",1,50);
					executeQuickSearchWithModuleIds(localStorage.sessionToken, item.RequestedObject.Guid,'',1,50);
					
				});
				
			}
			

		
		}
	} else {
			// Sorry! No Web Storage support..
			alert("pichon");
	}
	
	$('#bt-logout').click(function(){
		localStorage.removeItem("sessionToken");
		window.location=baseURL+'/index.html';
		$('#login').show();
		$('#bt-logout').hide()
    });

});

function getAllAplications (sessionToken){//funcion para correr los DF
	var debugging = true;
	var apps;
	var baseURL = 'https://10.100.107.90';
	if (debugging) {
	  //console.log(baseURL);
	}

	$.ajax({
		type: "POST",
		url: baseURL+'/api/core/system/application',
		contentType: 'application/json',
		processData: false,
		async: false,
		dataType: 'json',
		headers: {
			"Authorization" : "Archer session-id="+sessionToken,
			"X-Http-Method-Override" : "GET"
		},
		success: function(data, textStatus, jqXHR) {
			apps = data;
		},
		error: function(jqXHR, textStatus, errorThorwn) {
			localStorage.removeItem("sessionToken");
			alert('Se ocurrio un error al traer las aplicaciones.');
			if (debugging) {
			  console.log(jqXHR);
			  console.log(('!! Problem executing data feed: ' + textStatus));
			  console.log(errorThorwn);
			}
			window.location=baseURL+':4433/index.html';
		}

	});

	return apps;
}

function fieldDefinition (sessionToken, appid){//funcion para correr los DF
	var debugging = true;
	var apps;
	var baseURL = 'https://localhost';
	if (debugging) {
	  //console.log(baseURL);
	}

	$.ajax({
		type: "POST",
		url: baseURL+'/api/core/system/fielddefinition/application/'+appid,
		contentType: 'application/json',
		processData: false,
		async: false,
		dataType: 'json',
		headers: {
			"Authorization" : "Archer session-id="+sessionToken,
			"X-Http-Method-Override" : "GET"
		},
		success: function(data, textStatus, jqXHR) {
			console.log(data);
		},
		error: function(jqXHR, textStatus, errorThorwn) {
			alert('Se ha vencido el session token');
			if (debugging) {
			  console.log(jqXHR);
			  console.log(('!! Problem executing data feed: ' + textStatus));
			  console.log(errorThorwn);
			}
		}

	});

	return apps;
}

function executeQuickSearchWithModuleIds (sessionToken, moduleIds, keywords, pageNumber, pageSize){
	$.soap({
		url: 'https://10.100.107.90/ws/search.asmx',
		method: 'ExecuteQuickSearchWithModuleIds',
		SOAPAction: 'http://archer-tech.com/webservices/ExecuteQuickSearchWithModuleIds',
		namespaceURL: 'http://archer-tech.com/webservices/',
		appendMethodToURL: false,

		data: {
			sessionToken: sessionToken,
			moduleIds: moduleIds,
			keywords: keywords,
			pageNumber: pageNumber,
			pageSize: pageSize
		},

		success: function (soapResponse) {
			// do stuff with soapResponse
			// if you want to have the response as JSON use soapResponse.toJSON();
			// or soapResponse.toString() to get XML string
			// or soapResponse.toXML() to get XML DOM
			console.log('Ok');
			console.log(soapResponse);
		},
		error: function (SOAPResponse) {
			// show error
			console.log('Error');
			console.log(SOAPResponse);
		}
	});
}

function executeSearch (sessionToken, searchOptions, pageNumber){
	$.soap({
		url: 'https://10.100.107.90/ws/search.asmx',
		method: 'ExecuteSearch',
		SOAPAction: 'http://archer-tech.com/webservices/ExecuteSearch',
		namespaceURL: 'http://archer-tech.com/webservices/',
		appendMethodToURL: false,

		data: {
			sessionToken: sessionToken,
			searchOptions: moduleIds,
			pageNumber: pageNumber,
		},

		success: function (soapResponse) {
			// do stuff with soapResponse
			// if you want to have the response as JSON use soapResponse.toJSON();
			// or soapResponse.toString() to get XML string
			// or soapResponse.toXML() to get XML DOM
			console.log('Ok');
			console.log(soapResponse);
		},
		error: function (SOAPResponse) {
			// show error
			console.log('Error');
			console.log(SOAPResponse);
		}
	});
}