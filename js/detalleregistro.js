var bdCModuleId = 2467; //Id de la aplicación Base de Conocimiento
var urls = {
			"content": 'https://10.100.107.90:8088/https://172.16.1.52/api/core/content/',
			"valuesREST": 'https://10.100.107.90:8088/https://172.16.1.52/api/core/system/valueslistvalue/flat/valueslist/'
	}

$(document).ready(function() {

$('#f-editReg').hide();

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

	if (getParameterByName("id")){
		//getRecordById(localStorage.sessionToken, bdCModuleId, getParameterByName("id"))
		executeSearch(localStorage.sessionToken, createFieldValuesRegistro(getParameterByName("id")), 1);
		content = getAPICall(localStorage.sessionToken, urls.content+getParameterByName("id"));
		loadContent(content);
		$('#bt-del').click(function(){
			deleteRecord(localStorage.sessionToken, bdCModuleId, getParameterByName("id"));
		});
		$('#bt-edit').click(function(){
			$('#c-detalle').hide();
			$('#f-editReg').show();
			
		});
		
		$('#bt-editar').click(function(){
			if(soapAPICall(editRecordArray(bdCModuleId, getParameterByName("id")))){
				location.reload();
			}
		});
		
		
			
		$('#bt-cancelar').click(function(){
			$('#c-detalle').show();
			$('#f-editReg').hide();
		});
	}
	/*
	$('#sin').click(function(){
		$('#sin').addClass('active');
		$('#cau').removeClass('active');
		$('#sol').removeClass('active');
		$("#tab1").show();
		$("#tab2").hide();
		$("#tab3").hide();
	});
	$('#cau').click(function(){
		$('#sin').removeClass('active');
		$('#cau').addClass('active');
		$('#sol').removeClass('active');
		$("#tab1").show();
		$("#tab2").hide();
		$("#tab3").hide();
	});*/

	$('#bt-logout').click(function(){
		localStorage.removeItem("sessionToken");
		window.location=baseURL+'/index.html';
		$('#login').show();
		$('#bt-logout').hide()
    });

	$('#bt-mov-logout').click(function(){
		localStorage.removeItem("sessionToken");
		window.location=baseURL+'/index.html';
    });

	$('#bt-search').click(function (){
		window.location=baseURL+'/buscarregistro.html';
	});


});

function getRecordById (sessionToken, moduleId, contentId){
	$.soap({
		url: location.protocol+'//172.16.1.52/ws/record.asmx',
		method: 'GetRecordById',
		SOAPAction: 'http://archer-tech.com/webservices/GetRecordById',
		namespaceURL: 'http://archer-tech.com/webservices/',
		appendMethodToURL: false,

		data: {
			sessionToken: sessionToken,
			moduleId: moduleId,
			contentId: contentId
		},

		success: function (soapResponse) {
			console.log('Ok');
			console.log(soapResponse);
			//console.log(soapResponse.content.documentElement.getElementsByTagName('GetRecordByIdResult'));
			//console.log(soapResponse.content.documentElement.getElementsByTagName('GetRecordByIdResult')[0].lastChild.data);

			record = document.createElement('GetRecordByIdResult');
			record.innerHTML = soapResponse.content.documentElement.getElementsByTagName('GetRecordByIdResult')[0].lastChild.data;

		},
		error: function (SOAPResponse) {
			// show error
			console.log('Error');
			console.log(SOAPResponse);
			alert('Ha ocurrido un error al crear un registro: \n'+SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML);
			if (SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML ="Server was unable to process request. ---&gt; Invalid session token"){
				localStorage.removeItem("sessionToken");
				window.location='https://172.16.1.52:4433/index.html';
			}
		}
	});
}

function loadContent(data){
		if (data.IsSuccessful){
			fieldContents = data.RequestedObject.FieldContents;
			/*$('#sp-titulo').html(fieldContents['22517'].Value);
			$('#p-sintoma').html("<p>" + fieldContents['22521'].Value + "</p>");
			$('#p-causa').html("<p>" + fieldContents['22525'].Value + "</p>");
			$('#p-solucion').html("<p>" + fieldContents['22526'].Value + "</p>");
			$('#sp-fab').html("Fabricante: " + fieldContents['22523'].Value.ValuesListIds[0]);
			$('#sp-tec').html("Tecnología: " + fieldContents['22520'].Value.ValuesListIds[0]);
			$('#p-modelo').html("Modelo/s: " + fieldContents['22528'].Value);*/
			$('#titulo').val(fieldContents['22517'].Value);
			$('#sint').val(fieldContents['22521'].Value);
			$('#caus').val(fieldContents['22525'].Value);
			$('#solu').val(fieldContents['22526'].Value);
			$('#mod').val(fieldContents['22528'].Value);
			$('#tec').val(fieldContents['22520'].Value.ValuesListIds[0]);
			$('#fab').val(fieldContents['22523'].Value.ValuesListIds[0]);
			$('#area').val(fieldContents['22524'].Value.ValuesListIds[0]);
			if (fieldContents['22527'].Value){
					attachments = fieldContents['22527'].Value;
					for (i=0; i<attachments.length; i++){
							attachment = getAPICall(localStorage.sessionToken, urls.content+'attachment/'+attachments[i])
							mimeType = getMymeType(attachment.RequestedObject.AttachmentName.split('.')[1]);
							var a = document.createElement("a");
								a.href = 'data:'+mimeType+';base64,'+attachment.RequestedObject.AttachmentBytes;
								a.innerHTML='<i class="material-icons">file_download</i>';
								a.setAttribute('download', attachment.RequestedObject.AttachmentName);
								document.getElementById('buttons').appendChild(a);

					}
			}
		} else {
			alert("Ocurrio un error al cargar el registro.");
			window.location='https://172.16.1.52:4433/buscarregistro.html';;
		}
}

function getMymeType(ext){
		ext = ext.toLowerCase();
		mimeType = '';
		switch(ext){
			case 'docx':
				mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
				break;
			case 'doc':
			case 'dot':
					mimeType = 'application/msword';
					break;
			case 'xls':
			case 'xlm':
			case 'xla':
			case 'xlc':
			case 'xlt':
			case 'xlw':
				mimeType = 'application/vnd.ms-exce';
				break;
			case 'xlsx':
					mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
					break;
			case 'pdf':
				mimeType = 'application/pdf';
				break;
			case 'csv':
					mimeType = 'text/csv';
					break;
			case 'txt':
			case 'text':
			case 'conf':
			case 'def':
				mimeType = 'text/plain';
				break;
			case 'png':
					mimeType = 'image/png';
					break;
			case 'jpeg':
			case 'jpg':
			case 'jpe':
				mimeType = 'image/jpeg';
				break;
			case 'gif':
				mimeType = 'image/gif';
				break;
			case '':
					mimeType = '';
					break;
		}

		return mimeType;
}

function deleteRecord (sessionToken, moduleId, contentId){
	$.soap({
		url: location.protocol+'//172.16.1.52/ws/record.asmx',
		method: 'DeleteRecord',
		SOAPAction: 'http://archer-tech.com/webservices/DeleteRecord',
		namespaceURL: 'http://archer-tech.com/webservices/',
		appendMethodToURL: false,

		data: {
			sessionToken: sessionToken,
			moduleId: moduleId,
			contentId: contentId
		},

		success: function (soapResponse) {
			console.log('Ok');
			console.log(soapResponse);
			//console.log(soapResponse.content.documentElement.getElementsByTagName('GetRecordByIdResult'));
			//console.log(soapResponse.content.documentElement.getElementsByTagName('GetRecordByIdResult')[0].lastChild.data);
			alert('Se ha eliminado el registro');
			window.location='https://172.16.1.52:4433/buscarregistro.html';


		},
		error: function (SOAPResponse) {
			// show error
			console.log('Error');
			console.log(SOAPResponse);
			alert('Ha ocurrido un error al crear un registro: \n'+SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML);
			if (SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML ="Server was unable to process request. ---&gt; Invalid session token"){
				localStorage.removeItem("sessionToken");
				window.location='https://172.16.1.52:4433/index.html';
			}
		}
	});
}

function createFieldValuesRegistro(txticket){
	txtt = '';
	if(txticket != '')txtt = '<Filter>'+
								  '<Conditions>'+
									'<TextFilterCondition>'+
									  '<Operator>Contains</Operator>'+
									  '<Field name="Numero de ticket">22518</Field>'+ //Id de idtxt (campo calculado del id de rastreo)
									  '<Value>'+txticket+'</Value>'+
									'</TextFilterCondition>'+
								  '</Conditions>'+
								'</Filter>';
	xml = ['<![CDATA[',
				'<SearchReport>',
					'<PageSize>100</PageSize>',
					'<DisplayFields>',
						'<DisplayField name="Titulo">'+22517+'</DisplayField>',
						'<DisplayField name="Sintoma">'+22521+'</DisplayField>',
						'<DisplayField name="Causa">'+22525+'</DisplayField>',
						'<DisplayField name="Solucion">'+22526+'</DisplayField>',
						'<DisplayField name="Fabricante">'+22523+'</DisplayField>',
						'<DisplayField name="Tecnología">'+22520+'</DisplayField>',
						'<DisplayField name="Modelo/s">'+22528+'</DisplayField>',
					'</DisplayFields>',
					'<Criteria>',
						'<ModuleCriteria>',
							'<Module>'+bdCModuleId+'</Module>',
						'</ModuleCriteria>',
						txtt,
					'</Criteria>',
				'</SearchReport>',
			']]>'];
	return xml.join('');
}

function executeSearch (sessionToken, searchOptions, pageNumber){
	$.soap({
		url: location.protocol+'//172.16.1.52/ws/search.asmx',
		method: 'ExecuteSearch',
		SOAPAction: 'http://archer-tech.com/webservices/ExecuteSearch',
		namespaceURL: 'http://archer-tech.com/webservices/',
		appendMethodToURL: false,

		data: {
			sessionToken: sessionToken,
			searchOptions: searchOptions,
			pageNumber: pageNumber
		},

		success: function (soapResponse) {
			// do stuff with soapResponse
			// if you want to have the response as JSON use soapResponse.toJSON();
			// or soapResponse.toString() to get XML string
			// or soapResponse.toXML() to get XML DOM
			console.log('Ok');
			console.log(soapResponse);
			//console.log(soapResponse.content.documentElement.getElementsByTagName('ExecuteSearchResult')[0].lastChild.data);
			var xmlDoc = jQuery.parseXML(soapResponse.content.documentElement.getElementsByTagName('ExecuteSearchResult')[0].lastChild.data);
			console.log(xmlDoc);
			fields = xmlDoc.documentElement.getElementsByTagName('Field');
			fieldDefinitions = xmlDoc.documentElement.getElementsByTagName('FieldDefinition')
			for (i = 0; i < fields.length; i++){
				console.log(fieldDefinitions[i].attributes[2].value
				+ fields[i].innerHTML); //Solo vale cuando hay un solo registro
			}

			$('#a-link').attr('href','https://172.16.1.52/apps/ArcherApp/Home.aspx#record/'+bdCModuleId+'/368/'+xmlDoc.documentElement.getElementsByTagName('Record')[0].getAttribute('contentId'));
			///apps/ArcherApp/Home.aspx#record/bdCModuleId/368/
			$('#sp-titulo').html(xmlDoc.documentElement.getElementsByTagName('Field')[0].innerHTML);
			$('#p-sintoma').html("<p>" + xmlDoc.documentElement.getElementsByTagName('Field')[1].innerHTML + "</p>");
			$('#p-causa').html("<p>" + xmlDoc.documentElement.getElementsByTagName('Field')[2].innerHTML + "</p>");
			$('#p-solucion').html("<p>" + xmlDoc.documentElement.getElementsByTagName('Field')[3].innerHTML + "</p>");
			$('#sp-fab').html("Fabricante: " + xmlDoc.documentElement.getElementsByTagName('ListValue')[0].innerHTML);
			$('#sp-tec').html("Tecnología: " + xmlDoc.documentElement.getElementsByTagName('ListValue')[1].innerHTML);
			$('#p-modelo').html("Modelo/s: " + xmlDoc.documentElement.getElementsByTagName('Field')[6].innerHTML);


			$('#p-cantidadhoras').html("Cantidad de horas utilizadas: "+xmlDoc.documentElement.getElementsByTagName('Field')[2].innerHTML);

		},
		error: function (SOAPResponse) {
			// show error
			console.log('Error');
			console.log(SOAPResponse);
			alert('Ha ocurrido un error al crear un registro: \n'+SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML);
			if (SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML ="Server was unable to process request. ---&gt; Invalid session token"){
				localStorage.removeItem("sessionToken");
				window.location='https://172.16.1.52:44331/index.html';
			}
		}
	});
}

function getAPICall(sessionToken, url){
		var response = '';

		$.ajax({
				 type: "GET",
				 url: url,
				 headers: {
						 'Accept':'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
						 'Authorization':'Archer session-id='+sessionToken,
						 'Content-Type': 'application/json'
				 },
				 contentType: 'application/json',
				 processData: false,
				 async: false,
				 dataType: 'json',
				 success: function(data, textStatus, jqXHR) {
					 console.log(data);
					 response = data;
					 if (data.IsSuccessful){
							 response = data;
					 }
				},
				error: function(jqXHR, textStatus, errorThorwn) {
							console.log(jqXHR);
							console.log(('Ocurrio un error al llamar a la API: ' + textStatus));
							console.log(errorThorwn);
				}

		});

		return response;
}


//----------------------------------------------------------Editar Registro--------------------------------------------------

function editFieldValuesRegistro(){

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
	//soluc = '<Field id="22526" value="'+$('#solu').val()+'"></Field>';
	fieldValues2 = '</fieldValues>';
	ccdata = ' ]]>';

	fieldValues = [cdata, fieldValues1, titulo, area, fabri, tec, mod, sint, causa, fieldValues2, ccdata];
	

	return fieldValues.join('');
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

function editRecordArray(moduleId, contentId){
	headers = {
		url: location.protocol+'//172.16.1.52/ws/record.asmx',
		method: 'UpdateRecord',
		SOAPAction: 'http://archer-tech.com/webservices/UpdateRecord',
		namespaceURL: 'http://archer-tech.com/webservices/'
	}
	
	data= {
		sessionToken: localStorage.sessionToken,
		moduleId: moduleId,
		contentId: contentId,
		fieldValues: editFieldValuesRegistro()
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

function getParameterByName(name) {
 return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
