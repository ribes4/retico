var socket = io();
var idJugador=0;

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
	idJugador = id;
	alert("La teva id: "+idJugador);
});

socket.on('pose',function(data){
	 $("#plataforma").append(data);
});

