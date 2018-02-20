$(document).ready(function() {
	$('#div-tec').hide();
	$('#div-fab').hide();
	$('#table').hide();
	$('#bt-research').hide();
	
	
	
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
			console.log('Fabricantes');
			getValuesList(localStorage.sessionToken, 5682, $('#fab'));
			console.log('Tecnologías');
			getValuesList(localStorage.sessionToken, 5681, $('#tec'));
		}
	} else {
			// Sorry! No Web Storage support..
			alert("pichon");
	}
	
	$('#check').click(function(){
		if($('#check')[0].checked){
			$('#div-tec').show();
		} else{
			$('#div-tec').hide();
		}
	});
	
	$('#check2').click(function(){
		if($('#check2')[0].checked){
			$('#div-fab').show();
		} else{
			$('#div-fab').hide();
		}
	});
	$('#bt-research').click(function(){
		$('#table').hide();
		$('#f-buscar').show();
		$('bt-research').hide();
		
    });
	
	$('#bt-buscar').click(function(){
		$('#table').show();
		$('bt-research').show();
		executeSearch(localStorage.sessionToken, createSearchOptionsHora($('#keyword').val()), 1);
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
function createOption(selecte, value){
	html = '<option value="'+value.children[1].innerHTML+'">'+value.children[2].innerHTML+'</option>';
	selecte.append(html);
}

function getValuesList (sessionToken, valuesListId, selecte){
	$.soap({
		url: 'https://10.100.107.90/ws/field.asmx',
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
				window.location='https://10.100.107.90:4433/index.html';
			}
		}
	});
}

function createSearchOptionsHora(txticket){
	txtt = '';
	tecnologia = '';
	fabricante = '';
	if($('#check')[0].checked){
		tecnologia= '<ValueListFilterCondition>'+
						'<Operator>Contains</Operator>'+
						'<Field>30529</Field>'+
						'<IsNoSelectionIncluded>False</IsNoSelectionIncluded>'+
						'<Values>'+
							'<Value>'+$('#tec').val()+'</Value>'+
						'</Values>'+
					'</ValueListFilterCondition>';
	}
	if($('#check2')[0].checked){
		fabricante= '<ValueListFilterCondition>'+
						'<Operator>Contains</Operator>'+
						'<Field>30532</Field>'+
						'<IsNoSelectionIncluded>False</IsNoSelectionIncluded>'+
						'<Values>'+
							'<Value>'+$('#fab').val()+'</Value>'+
						'</Values>'+
					'</ValueListFilterCondition>';
		console.log(fabricante);
	}
	if(txticket != '')txtt = '<TextFilterCondition>'+
									  '<Operator>Contains</Operator>'+
									  '<Field name="Numero de ticket">30530</Field>'+
									  '<Value>'+txticket+'</Value>'+
									'</TextFilterCondition>';
	xml = ['<![CDATA[',
				'<SearchReport>',
					'<PageSize>100</PageSize>',
					'<DisplayFields>',
						'<DisplayField name="Titulo">'+30523+'</DisplayField>',
						'<DisplayField name="Sintoma">'+30530+'</DisplayField>',
						'<DisplayField name="Solucion">'+30535+'</DisplayField>',
						'<DisplayField name="Fabricante">'+30532+'</DisplayField>',
						'<DisplayField name="Tecnología">'+30529+'</DisplayField>',
					'</DisplayFields>',
					'<Criteria>',
						'<ModuleCriteria>',
							'<Module>542</Module>',
						'</ModuleCriteria>',
						'<Filter>',
							'<Conditions>',
								txtt,
								tecnologia,
								fabricante,
							'</Conditions>',
						'</Filter>',
					'</Criteria>',
				'</SearchReport>',
			']]>'];
			console.log(xml.join(''));
	return xml.join('');
}

function createRecordRow(record){
	html = ['<tr>',
			  '<td><a href="detalleregistro.html?id='+record.getAttribute('contentId')+'">'+record.children[0].innerHTML+'</a></td>',
			  '<td>'+record.children[1].innerHTML+'</td>',
			  '<td>'+record.children[3].innerHTML+'</td>',
			  '<td>'+record.children[4].innerHTML+'</td>',
		'</tr>'
	];
	
	$('#tbody').append(html.join(''));
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
			var xmlDoc = jQuery.parseXML(soapResponse.content.documentElement.getElementsByTagName('ExecuteSearchResult')[0].lastChild.data);
			console.log(xmlDoc);
			$('#tbody').html('');
			for (i = 0; i < xmlDoc.documentElement.getElementsByTagName('Record').length; i++){
				record = xmlDoc.documentElement.getElementsByTagName('Record')[i];
				createRecordRow(record);
			}
		},
		error: function (SOAPResponse) {
			// show error
			console.log('Error');
			console.log(SOAPResponse);
			alert('Ha ocurrido un error al buscar un registro: \n'+SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML);
			if (SOAPResponse.content.documentElement.getElementsByTagName('faultstring')[0].innerHTML ="Server was unable to process request. ---&gt; Invalid session token"){
				localStorage.removeItem("sessionToken");
				window.location='https://10.100.107.90:4433/index.html';
			}
		}
	});
}
