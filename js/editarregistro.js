var bdCModuleId = 2467; //Id de la aplicación Base de Conocimiento

$(document).ready(function() {
	$('#btn-delfile').hide();


	//
	if (typeof(Storage) !== "undefined") {
		if (!localStorage.sessionToken) {
			window.location='index.html';
		} else{

			console.log(localStorage.sessionToken);
			console.log('Area');
			areas = soapAPICall(getValuesListArray(5886));
			console.log(areas);
			loadSelects(areas, $('#area'));
			console.log('Fabricantes');
			areas = soapAPICall(getValuesListArray(2682));
			loadSelects(areas, $('#fab'));
			console.log('Tecnologias');
			areas = soapAPICall(getValuesListArray(2681));
			loadSelects(areas, $('#tec'));
		}
	} else {
			// Sorry! No Web Storage support..
			alert("Ha ocurrido un error al intentar utilizar SessionStorage");
	}

	$('#bt-eregistro').click(function(){
		 	soapAPICall(createFieldValuesRegistro());
			soapAPICall(getValuesListArray());
			soapAPICall(editRecordArray());
	});

	$('#bt-logout').click(function(){
		localStorage.removeItem("sessionToken");
		window.location=baseURL+'/index.html';
  });

	$('#bt-mov-logout').click(function(){
		localStorage.removeItem("sessionToken");
		window.location=baseURL+'/index.html';
  });

	$('#btn-delfile').click(function(){
			$('#files').val('');
			$('#txt').val('');
			$('#btn-delfile').hide();
  });

	$('#files').change(function(){
		$('#btn-delfile').show();
	});

});

function createFieldValuesRegistro(){
	headers = {
		url: location.protocol+'//172.16.1.52/ws/field.asmx',
		method: 'GetValuesList',
		SOAPAction: 'http://archer-tech.com/webservices/GetValuesList',
		namespaceURL: 'http://archer-tech.com/webservices/'
	}

	data = {
		sessionToken: localStorage.sessionToken,
		moduleId: moduleId,
		fieldValues: ''
	}

	// TODO: Se podria automatizar la busqueda de los id trayendo la definicion de los campos de la aplicación y filtrando por alias.
	// Se hace via REST

	cdata = '<![CDATA[';
	fieldValues1 = '<fieldValues>';
	titulo = '<Field id="22517" value="'+$('#titulo').val()+'"></Field>';
	area = '<Field id="22524" value="'+$('#area').val()+'"></Field>';
	fabri = '<Field id="22523" value="'+$('#fab').val()+'"></Field>';
	tec = '<Field id="22520" value="'+$('#tec').val()+'"></Field>';
	mod = '<Field id="22528" value="'+$('#mod').val()+'"></Field>';
	sint = '<Field id="22521" value="'+$('#sint').val()+'"></Field>';
	causa = '<Field id="22525" value="'+$('#caus').val()+'"></Field>';
	soluc = '<Field id="22526" value="'+$('#solu').val()+'"></Field>';
	fieldValues2 = '</fieldValues>';
	ccdata = ']]>';

	fieldValues = [cdata, fieldValues1, titulo, area, fabri, tec, mod, sint, causa, soluc, fieldValues2, ccdata];
	fieldValues.join('');
	data.fieldValues = fieldValues;

	return [headers, data]
}

function getValuesListArray(valuesListId){
	headers = {
		url: location.protocol+'//172.16.1.52/ws/field.asmx',
		method: 'GetValuesList',
		SOAPAction: 'http://archer-tech.com/webservices/GetValuesList',
		namespaceURL: 'http://archer-tech.com/webservices/'
	}

	data = {
		sessionToken: localStorage.sessionToken,
		valuesListId: valuesListId
	}

	return [headers, data]
}

function editRecordArray(moduleId, contentId, fieldValues){
	headers = {
		url: location.protocol+ '172.16.1.52/ws/record.asmx',
		method: 'UpdateRecord',
		SOAPAction: 'http://archer-tech.com/webservices/UpdateRecord',
		namespaceURL: 'http://archer-tech.com/webservices/'
	}
	
	data= {
		sessionToken: localStorage.sessionToken,
		moduleId: moduleId,
		contentId: contentId,
		fieldValues: fieldValues,
		
	}
	
	return [headers, data]
}


function loadSelects(soapResponse, selecte){
	valuesHTML = document.createElement('GetValuesListResponse');
	valuesHTML.innerHTML = soapResponse.content.documentElement.getElementsByTagName('GetValuesListResponse')[0].textContent;
	console.log(valuesHTML);
	values = valuesHTML.getElementsByTagName('selectdefvalue');
	console.log(values);
	for (i = 0; i < values.length ; i++){
		createOption(selecte, values[i]);
	}
}

function createOption(selecte, value){
	html = '<option value="'+value.children[1].innerHTML+'">'+value.children[2].innerHTML+'</option>';
	selecte.append(html);
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
				console.log(response);
		},
		error: function (SOAPResponse) {
			console.log('Error');
			alert('Ha ocurrido un error al crear un registro: \n'+SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML);
			if (SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML ="Server was unable to process request. ---&gt; Invalid session token"){
				localStorage.removeItem("sessionToken");
				window.location='https://172.16.1.52:4433/index.html';
			}
		}
	});

	return response;
}

