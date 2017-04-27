var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Import utilities.
var util = require('./lib/util');
var users=[];
var sockets = {};

var nTeams = 2;
var tempsIniciPartida = 10;
var tempsFinalPartida = 10;
var width=1000;
var height=2000;
var radius=50;
var velocitat=5;
var enjoc = false;
var partidaAcabada = false;
var restaurat = false;
var compteEnrere = false;
var esperaFinal = false;
var momentActualInici;
var momentActualFinal;

var degMin = 0;
var degMax = 0;

var Equips=[];
var llistaEspera=[];

for(var i=0;i<nTeams;i++){
	var mq = (width/nTeams);
	var posX = (i*mq)+(mq/2);
	var posY = height-(radius*2);
	var e = {
		id: i+1,
		x: posX,
		y: posY,
		players: [],
		hue: Math.round(Math.random()*360)
	};
	Equips.push(e);
}


app.set('port', process.env.PORT || 3000);

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile( __dirname + "/" + "index.html" );
});


io.on('connection', function(socket){
	var currentPlayer = {
		id: socket.id,
		x: 0,
		y: 0,
		hue: Math.round(Math.random() * 360),
		lastHeartbeat: new Date().getTime(),
		target: {
		    x: 0,
		    y: 0
		},
		team: 0,
		jugant: true
	};	


	//es crida quan el client ha emplenat el nick i vol començar el joc
	socket.on('respawn', function (){
		//busca si hi ha el jugador a la llista d'usuaris
		if (util.findIndex(users, currentPlayer.id) > -1){
			//si troba el client l'elimina
			users.splice(util.findIndex(users, currentPlayer.id), 1);
		}
		//emet welcome, per enviar les dades al client
		socket.emit('welcome', currentPlayer);
		console.log('[INFO] User ' + currentPlayer.name + ' respawned!');
	});

	/*socket.on('nickname', function(nickname){
		
		var player = [id,nickname];
		socket.emit('welcome',id);
		id++;
		
		if(teamA.length > teamB.length){
			teamB.push(player);
			mostrar();
		}
		else if(teamB.length > teamA.length){
			teamA.push(player);
			mostrar();
		}
		else{
			var rnd = Math.floor((Math.random() * 2) + 1);
			if(rnd == 1){
				teamA.push(player);
				mostrar();
			}
			else{
				teamB.push(player);
				mostrar();
			}
		}
	});*//*
	socket.on("init_pose", function(data){
		poses.push(data);
		io.emit("pose",poses);
	});*/
	
	/*socket.on("moure", function(data){
		for( i=0;i< poses.length;i++){
			if(poses[i].id==data.id){
				poses[i].jugadorPrincipal = "<div id="+data.id+" class='player' type= 'player' name='player' style =' background-color:#f220e6;position:absolute;left:"+data.style.left+"; top:"+data.style.top+"'>"+data.id+"</div>"				
			}
		}
		io.emit("movent",data);
	});*/


	socket.on('gotit', function(player){
		console.log('[INFO] Player ' + player.name + ' connecting!');
		if (util.findIndex(users, player.id) > -1) {
			console.log('[INFO] Player ID is already connected, kicking.');
			socket.disconnect();
		}
		else {
			console.log('[INFO] Player ' + player.name + ' connected!');
			sockets[player.id] = socket;

			player.x = height/2;
			player.y = width/2;
			player.target.x = 0;
			player.target.y = 0;
			currentPlayer = player;
		    currentPlayer.lastHeartbeat = new Date().getTime();
		    users.push(currentPlayer);

			
			//assigna el jugador al equip amb menys jugadors
			if(enjoc){
				llistaEspera.push(currentPlayer);
			}
			else{
				assignarEquip(currentPlayer);
			}
			
			/*var equip=0;
			for(var i=0;i<Equips.length;i++){
				if(Equips[equip].players.length > Equips[i].players.length){
				if(Equips[equip].players.length > Equips[i].players.length){
					equip = i;
				}
			}
			
			currentPlayer.team = Equips[equip].id;
			Equips[equip].players.push(currentPlayer);
			
			mostrar();
			
			sockets[player.id].emit('setTeam',currentPlayer.team);*/
			
			/*if(teamA.length > teamB.length){
				teamB.push(currentPlayer);
				mostrar();
			}
			else if(teamB.length > teamA.length){
				teamA.push(currentPlayer);
				mostrar();
			}
			else{
				var rnd = Math.floor((Math.random() * 2) + 1);
				if(rnd == 1){
					teamA.push(currentPlayer);
					mostrar();
				}
				else{
					teamB.push(currentPlayer);
					mostrar();
				}
			}*/
		    	
		    	
			socket.emit('gameSetup', {
				gameWidth: width,
				gameHeight: height
			});

			console.log('Total players: ' + users.length);
		}
	});
	
	socket.on('windowResized', function (data) {
		currentPlayer.screenWidth = data.screenWidth;
		currentPlayer.screenHeight = data.screenHeight;
	});
	
	socket.on('disconnect', function(){
		if (util.findIndex(users, currentPlayer.id) > -1){
			//elimina el jugador de la llista de users
			users.splice(util.findIndex(users, currentPlayer.id), 1);
		}

		for(var i=0;i<Equips.length;i++){
			if (util.findIndex(Equips[i].players, currentPlayer.id) > -1){
				Equips[i].players.splice(util.findIndex(Equips[i].players, currentPlayer.id), 1);
			}
		}
		
        console.log('[INFO] User ' + currentPlayer.name + ' disconnected!');

        //socket.broadcast.emit('playerDisconnect', { name: currentPlayer.name });
	});
	
	// Heartbeat function, update everytime.
	socket.on('0', function(target) {
		currentPlayer.lastHeartbeat = new Date().getTime();
		if (target.x !== currentPlayer.x || target.y !== currentPlayer.y) {
			currentPlayer.target = target;
			//console.log(currentPlayer.x + ', ' + currentPlayer.y);
		}
	});
});

function assignarEquip(player){
	var equip=0;
	for(var i=0;i<Equips.length;i++){
		if(Equips[equip].players.length > Equips[i].players.length){
			equip = i;
		}
	}
	
	player.team = Equips[equip].id;
	Equips[equip].players.push(player);
	
	sockets[player.id].emit('setTeam',player.team);
	
	mostrar();
}

function mostrar(){

	for(var j=0;j<Equips.length;j++){
		console.log("\n\nEquip " + Equips[j].id);
		if(Equips[j].players.length > 0){
			for(var i=0;i<Equips[j].players[i].length;i++){
				var jugador = Equips[j].players[i];
				console.log(jugador.id+": "+jugador.name);
			}
		}
	}
}

function sendUpdate(){
	users.forEach(function(u){
		sockets[u.id].emit('serverTellTeamMove', Equips);
	});
}

function moveloop(){
	if(enjoc){
		for(var i=0;i<Equips.length;i++){
			if(Equips[i].players.length > 0){
				moveTeam(Equips[i]);
			}
		}
	}
	else{
		if(partidaAcabada){
			restaurat = false;
			
			if(!esperaFinal){
				momentActualFinal = new Date().getTime();
				esperaFinal = true;
			}
			else{
				var tactual = new Date().getTime();
				var timeFinal = tempsFinalPartida - ((tactual - momentActualFinal)/1000);
				
				if(timeFinal < 0){
					users.forEach(function(u){
						sockets[u.id].emit('restartGame');
					});
					esperaFinal = false;
					partidaAcabada = false;
				}
			}
						
		}
		else{//partida per començar. Esperant jugadors
			if(!restaurat){
				restaurarPartida();
				restaurat = true;
			}
			
			if(!hiHaSuficientsJugadors()){
				users.forEach(function(u){
					sockets[u.id].emit('first');
				});
			}			
			else{
				if(!compteEnrere){
					momentActualInici = new Date().getTime();
					compteEnrere = true;
				}
				else{
					var tactual = new Date().getTime();
					var timeToStart = tempsIniciPartida - ((tactual - momentActualInici)/1000);
					if(timeToStart < 0){
						compteEnrere = false;
						enjoc = true;
						
						users.forEach(function(u){
							sockets[u.id].emit('go');
						});
					}
					else{
						var temps = parseInt(timeToStart);
						if(temps < 0){
							temps = 0;
						}
						users.forEach(function(u){
							sockets[u.id].emit('timeToStart',temps);
						});
					}
				}
			}
			
		}
	}
}

function hiHaSuficientsJugadors(){
	for(var i=0;i<Equips.length;i++){
		if(Equips[i].players.length == 0){
			return false;
		}
	}
	return true;
}

function restaurarPartida(){
	
	for(var i=0;i<Equips.length;i++){
		posX = (i*mq)+(mq/2);
		Equips[i].x = posX;
		Equips[i].y = posY;
	}
	
	while(llistaEspera.length > 0){
		var player = llistaEspera.pop();
		assignarEquip(player);
	}
}

/*function movePlayer(player){
	
	/*var target = {
		x: player.x + player.target.x,
		y: player.y + player.target.y
	};*/
	//var dist = Math.sqrt(Math.pow(target.y,2) + Math.pow(target.x,2));
	
	/*if(equip(player)=='A'){
		var deg = Math.atan2(movimentA.y,movimentA.x);
	}
	else{ //equip='B'
		var deg = Math.atan2(movimentB.y,movimentB.x);
	}

	//var deg = Math.atan2(player.target.y,player.target.x);
	
	var nx, ny;
	nx = (Math.cos(deg)*velocitat) + player.x;
	ny = (Math.sin(deg)*velocitat) + player.y;
	
	if(nx > radius){
		if(nx < (width-radius)){
			player.x = nx;
		}
		else{
			player.x = width-radius;
		}
	}
	else{
		player.x = radius;
	}
	
	
	if(ny > radius){
		if(ny < (height-radius)){
			player.y = ny;
		}
		else{
			player.y = height-radius;
		}
	}
	else{
		player.y = radius;
	}
}*/

/*function equip(player){
	var equip='';
	var continuar = true;
	var pos = 0;
	while(continuar){
		var jugadorA = teamA[pos];
		if(player.id.localeCompare(jugadorA.id)==0){ //Jugador trobat a la Taula de l'equip A
			equip = 'A';
		}
		else{
			pos++;
		}
	}
	
	pos = 0;
	while(continuar){
		var jugadorB = teamB[pos];
		if(player.id.localeCompare(jugadorB.id)==0){ //Jugador trobat a la Taula de l'equip B
			equip = 'B';
		}
		else{
			pos++;
		}
	}

	return equip;
}*/

function moveTeam(team){

	var sumaX = 0;
	var sumaY = 0;
	
	
	for(var i=0;i<team.players.length;i++){
		sumaX += team.players[i].target.x;
		sumaY += team.players[i].target.y;
	}
	
	var target = {
		x: 0,
		y: 0
	};

	target.x = sumaX/team.players.length;
	target.y = sumaY/team.players.length;

	
	var deg = Math.atan2(target.y,target.x);

		
	var nx, ny;
	nx = (Math.cos(deg)*velocitat) + team.x;
	ny = (Math.sin(deg)*velocitat) + team.y;
		
	if(nx > radius){
		if(nx < (width-radius)){
			team.x = nx;
		}
		else{
			team.x = width-radius;
		}
	}
	else{
		team.x = radius;
	}
	
	
	if(ny > radius){
		if(ny < (height-radius)){
			team.y = ny;
		}
		else{
			team.y = height-radius;
		}
	}
	else{
		team.y = radius;
	}
	
	if(team.y < (radius*2)){
		finalCursa(team.id);
	}
}


function finalCursa(idGuanyador){
	enjoc = false;
	partidaAcabada = true;
	
	users.forEach(function(u){
		sockets[u.id].emit('finalCursa', idGuanyador);
	});
	
	
}

setInterval(moveloop,1000/60);
setInterval(sendUpdate,1000/40);

http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
