var bdCModuleId = 2467; //Id de la aplicación Base de Conocimiento

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
		createRecord(localStorage.sessionToken, bdCModuleId);
    });

	$('#bt-buscar').click(function(){
		alert($('#keyword').val());
		executeSearch(localStorage.sessionToken, createSearchOptionsHora($('#keyword').val()), 1);
    });

	$('#bt-search').click(function (){
		window.location=baseURL+'/buscarregistro.html';
	});

	$('#bt-logout').click(function(){
		localStorage.removeItem("sessionToken");
		window.location=baseURL+'/index.html';
    });

	$('#bt-mov-logout').click(function(){
		localStorage.removeItem("sessionToken");
		window.location=baseURL+'/index.html';
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

function createSearchOptionsHora(txticket){
	txtt = '';
	if(txticket != '')txtt = '<Filter>'+
								  '<Conditions>'+
									'<TextFilterCondition>'+
									  '<Operator>Contains</Operator>'+
									  '<Field name="Numero de ticket">30523</Field>'+
									  '<Value>'+txticket+'</Value>'+
									'</TextFilterCondition>'+
								  '</Conditions>'+
								'</Filter>';
	xml = ['<![CDATA[',
				'<SearchReport>',
					'<PageSize>100</PageSize>',
					'<DisplayFields>',
						'<DisplayField name="Horas">'+30522+'</DisplayField>',
						'<DisplayField name="Numero de Ticket">'+30523+'</DisplayField>',
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


function executeQuickSearchWithModuleIds (sessionToken, moduleIds, keywords, pageNumber, pageSize){
	$.soap({
		url: location.protocol+'//172.16.1.52/ws/search.asmx',
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
		},
		error: function (SOAPResponse) {
			// show error
			console.log('Error');
			console.log(SOAPResponse);
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
