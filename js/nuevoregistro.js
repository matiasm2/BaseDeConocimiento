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
			getValuesList(localStorage.sessionToken, 5886, $('#area'));
			console.log('Fabricantes');
			getValuesList(localStorage.sessionToken, 2682, $('#fab'));
			console.log('Tecnologias');
			getValuesList(localStorage.sessionToken, 2681, $('#tec'));
		}
	} else {
			// Sorry! No Web Storage support..
			alert("pichon");
	}

	$('#bt-nregistro').click(function(){
			var filesIds = [];
			files = $('#files')[0].files;
		 	if (files.length > 0){
					 console.log(1);
					 for (i=0; i<files.length; i++){
								 var fil =[files[i].name]
								 var reader = new FileReader();
								 reader.onload = function () {
										 console.log(reader.result.split(',',2));
										 fil.push(reader.result.split(',',2)[1]);
										 res = postAttachment(localStorage.sessionToken, fil[0] , fil[1]);
										 filesIds.push(res.RequestedObject.Id)
										 console.log(filesIds.length +" " +files.length );
										 if (filesIds.length == files.length ){
											 		json = createContentJSON(filesIds);
													postContent(localStorage.sessionToken, json);
										 }
								 }
								 reader.readAsDataURL(files[i]);

				 };

  	 	} else {
					json = createContentJSON([]);
					postContent(localStorage.sessionToken, json);
			}
});

	$('#bt-buscar').click(function(){
		alert($('#keyword').val());
		executeSearch(localStorage.sessionToken, createSearchOptionsHora($('#keyword').val()), 1);
    });

	$('#bt-search').click(function (){
		window.location='https://172.16.1.52:4433/buscarregistro.html';
	});

	$('#bt-logout').click(function(){
		localStorage.removeItem("sessionToken");
		window.location='https://172.16.1.52:4433/index.html';
    });

	$('#bt-mov-logout').click(function(){
		localStorage.removeItem("sessionToken");
		window.location='https://172.16.1.52:4433/index.html';
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
	return fieldValues.join('');
}

function createContentJSON(attachments){
		data = {
	       "Content":{
	           "LevelId" : 2261,
	           "FieldContents" : {
	                "22517": {
	                    "Type" : 1,
	                    "Value" : $('#titulo').val(),
	                     "FieldId": 22517
	                 },
	                 "22524": {
	                     "Type" : 4,
	                     "Value" : {
												 		"ValuesListIds" : [$('#area').val()],
														"OtherText" : null
													},
	                      "FieldId": 22524
	                  },
	                  "22523": {
	                      "Type" : 4,
	                      "Value" : {
															"ValuesListIds" : [$('#fab').val()],
															"OtherText" : null
														},
	                       "FieldId": 22523
	                   },
	                  "22520": {
	                      "Type" : 4,
	                      "Value" : {
															"ValuesListIds" :  [$('#tec').val()],
															"OtherText" : null
														},
	                       "FieldId": 22520
	                   },
	                   "22528": {
	                       "Type" : 1,
	                       "Value" : $('#mod').val(),
	                        "FieldId": 22528
	                    },
											"22521": {
	                        "Type" : 1,
	                        "Value" : $('#sint').val(),
	                         "FieldId": 22521
	                     },
											 "22525": {
		                       "Type" : 1,
		                       "Value" : $('#caus').val(),
		                        "FieldId": 22525
		                    },
												"22526": {
		                        "Type" : 1,
		                        "Value" : $('#solu').val(),
		                         "FieldId": 22526
		                     },
	                    "22527": {
	                        "Type" : 11,
	                        "Value" : attachments,
	                         "FieldId": 22527
	                     }

	                }
	            }
	        };

			return data;
}

function createOption(selecte, value){
	html = '<option value="'+value.children[1].innerHTML+'">'+value.children[2].innerHTML+'</option>';
	selecte.append(html);
}

function getValuesList (sessionToken, valuesListId, selecte){
	$.soap({
		url: location.protocol+'//172.16.1.52/ws/field.asmx',
		method: 'GetValuesList',
		SOAPAction: 'http://archer-tech.com/webservices/GetValuesList',
		namespaceURL: 'http://archer-tech.com/webservices/',
		appendMethodToURL: false,

		data: {
			sessionToken: sessionToken,
			valuesListId: valuesListId
		},

		success: function (soapResponse) {
			// do stuff with soapResponse
			// if you want to have the response as JSON use soapResponse.toJSON();
			// or soapResponse.toString() to get XML string
			// or soapResponse.toXML() to get XML DOM
			console.log('Ok');
			//console.log(soapResponse);
			valuesHTML = document.createElement('GetValuesListResponse');
			valuesHTML.innerHTML = soapResponse.content.documentElement.getElementsByTagName('GetValuesListResponse')[0].textContent;
			console.log(valuesHTML);
			values = valuesHTML.getElementsByTagName('selectdefvalue');
			console.log(values);
			for (i = 0; i < values.length ; i++){
				//console.log(values[i].children[1].innerHTML);
				//console.log(values[i].children[2].innerHTML);
				createOption(selecte, values[i]);
			}
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

function createRecord (sessionToken, moduleId){
	var fieldValues;
	$.soap({
		url: location.protocol+'//172.16.1.52/ws/record.asmx',
		method: 'CreateRecord',
		SOAPAction: 'http://archer-tech.com/webservices/CreateRecord',
		namespaceURL: 'http://archer-tech.com/webservices/',
		appendMethodToURL: false,


		/*data: function(SOAPObject) {
			root = new SOAPObject('CreateRecord');
				sessionTok = new SOAPObject('sessionToken');
				sessionTok.val(sessionToken);
				moduleI = new SOAPObject('moduleId');
				moduleI.val(moduleId);
				fieldValues = new SOAPObject('fieldValues');
					fhora = new SOAPObject('Field');
					fhora.attr('id', '30522');
					fhora.attr('value', $('#hora').val());
					fhora.end();
					fticket = new SOAPObject('Field');
					fticket.attr('id', '30523');
					fticket.attr('value', $('#ticket').val());
					fticket.end();
				fieldValues.appendChild(fhora);
				fieldValues.appendChild(fticket);
			root.appendChild(sessionTok);
			root.appendChild(moduleI);
			root.appendChild(fieldValues);
			return root;
		},*/

		data: {
			sessionToken: sessionToken,
			moduleId: moduleId,
			fieldValues: createFieldValuesRegistro()
		},

		success: function (soapResponse) {
			// do stuff with soapResponse
			// if you want to have the response as JSON use soapResponse.toJSON();
			// or soapResponse.toString() to get XML string
			// or soapResponse.toXML() to get XML DOM
			console.log('Ok');
			alert('Se ha creado el registro exitosamente');
			window.location='https://172.16.1.52:4433/detalleregistro.html?id='+soapResponse.content.documentElement.getElementsByTagName('CreateRecordResult')[0].innerHTML;
			console.log(soapResponse.content.documentElement.getElementsByTagName('CreateRecordResult')[0].innerHTML);

			//console.log(soapResponse.content.documentElement);
			//console.log(soapResponse.content.documentElement.getElementsByTagName('CreateRecordResult'));
			//console.log(soapResponse.content.documentElement.getElementsByTagName('CreateRecordResult')[0].innerHTML);

		},
		error: function (SOAPResponse) {
			// show error
			console.log('Error');
			alert('Ha ocurrido un error al crear un registro: \n'+SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML);
			if (SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML ="Server was unable to process request. ---&gt; Invalid session token"){
				localStorage.removeItem("sessionToken");
				window.location='https://172.16.1.52:4433/index.html';
			}
			console.log(SOAPResponse);
		}
	});
}

function postContent(sessionToken, content){
		var restAPICall = content;
		var response = '';

		$.ajax({
				 type: "POST",
				 url: 'https://10.100.107.90:8088/https://172.16.1.52/api/core/content',
				 data: JSON.stringify(restAPICall),
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
							 alert('Se ha creado el registro exitosamente');
			 				 window.location='https://172.16.1.52:4433/detalleregistro.html?id='+data.RequestedObject.Id;
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



function postAttachment(sessionToken, attachmentName, attachmentBytes){
		var restAPICall = {"AttachmentName":attachmentName, "AttachmentBytes":attachmentBytes};
		var response = '';

		$.ajax({
				 type: "POST",
				 url: 'https://10.100.107.90:8088/https://172.16.1.52/api/core/content/attachment',
				 data: JSON.stringify(restAPICall),
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
				},
				error: function(jqXHR, textStatus, errorThorwn) {
							console.log(jqXHR);
							console.log(('Ocurrio un error al llamar a la API: ' + textStatus));
							console.log(errorThorwn);
				}

		});

		return response;
}

function putAttachments(sessionToken, contentId, attachments){
		var restAPICall = {"Content":{
            "Id": contentId ,
            "LevelId" : 2261,
            "FieldContents" : {
                "22527": {
                    "Type" : 11,
                    "Value" : attachments,
                     "FieldId": 22527
                 }
                 }
             }};

		var response = '';

		$.ajax({
				 type: "PUT",
				 url: 'https://10.100.107.90:8088/https://172.16.1.52/api/core/content',
				 data: JSON.stringify(restAPICall),
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
				},
				error: function(jqXHR, textStatus, errorThorwn) {
							console.log(jqXHR);
							console.log(('Ocurrio un error al llamar a la API: ' + textStatus));
							console.log(errorThorwn);
				}

		});

		return response;
}
