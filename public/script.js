var socket = io();



function enterKey(event){
   		if (event.keyCode == 13) {
	    		play();
			return false;	
		}
	};

function play() {
	socket.emit('nickname',document.getElementById("nickname").value)
	document.getElementById("nickname").value="";
	location.href="/chat";
};

socket.on('id', function(id){
	sessionStorage.setItem('idJugador', id)
	alert("La teva id: "+id);
});

socket.on('pose',function(data){
	for (i=0;i< data.length;i++){
		var element = document.getElementById(data[i].id);
		console.log(element)
		if(!element){
			$("#plataforma").append(data[i].jugadorPrincipal);
		}
		else{
			element = data[i].jugadorPrincipal;
	
		}
	}
});

socket.on("movent",function(data){
	
	var move={
		left: data.style.left,
		top: data.style.top
	}
	//$("#"+data.jugadorPrincipal).css(move);
	$("#"+ data.id).css(move);
});

	  /*$('form').submit(function(){
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	  });
	  socket.on('chat message', function(msg){
		//$('#messages').append($('<li>').text(msg));
	  });
	  
	  //per capturar quina tecla es prem
	  $( "#m" ).keydown(function() {
		var event = window.event ? window.event : e;
		console.log(event.keyCode)
	  });*/
	  
		

function leftArrowPressed() {
	var element = document.getElementById(	sessionStorage.getItem('idJugador'));
	element.style.left = parseInt(element.style.left) - 1 + '%';
	var jugador={
		id: sessionStorage.getItem('idJugador'),
		style: element.style
	}
	socket.emit("moure",jugador);

}

function rightArrowPressed() {
	var element = document.getElementById(	sessionStorage.getItem('idJugador'));
	element.style.left = parseInt(element.style.left) + 1 + '%';
	var jugador={
		id: sessionStorage.getItem('idJugador'),
		style: element.style
	}
	socket.emit("moure",jugador);

}

function upArrowPressed() {
	var element = document.getElementById(	sessionStorage.getItem('idJugador'));
	element.style.top = parseInt(element.style.top) - 1 + '%';
	var jugador={
		id: sessionStorage.getItem('idJugador'),
		style: element.style
	}
	socket.emit("moure",jugador);

}

function downArrowPressed() {
	var element = document.getElementById(sessionStorage.getItem('idJugador'));
	element.style.top = parseInt(element.style.top) + 1 + '%';
	var jugador={
		id: sessionStorage.getItem('idJugador'),
		style: element.style
	}
	socket.emit("moure",jugador);

}

function moveSelection(evt) {
	var event = window.event ? window.event : e;
	console.log(event.keyCode)
	console.log(sessionStorage.getItem('idJugador'))
	switch (evt.keyCode) {
		case 37:
			leftArrowPressed();
			break;
		case 39:
			rightArrowPressed();
			break;
		case 38:
			upArrowPressed();
			break;
		case 40:
			downArrowPressed();
			break;
	}
	
};

function docReady()
{
	var obj={
		id: sessionStorage.getItem('idJugador'),
		jugadorPrincipal: "<div id="+sessionStorage.getItem('idJugador')+" class='player' type= 'player' name='player' style =' background-color:#f220e6;position:absolute;left:50%; top:50%'>"+sessionStorage.getItem('idJugador')+"</div>"
	}
	
	socket.emit("init_pose",obj);
	
	window.addEventListener('keydown', moveSelection);
}
