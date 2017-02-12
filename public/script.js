var socket = io();
var idJugador=0;

function play() {
	socket.emit('nickname',document.getElementById("nickname").value)
	document.getElementById("nickname").value="";
	location.href="/chat";
};

socket.on('id', function(id){
	idJugador = id;
	alert("La teva id: "+idJugador);
});