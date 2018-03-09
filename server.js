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
var width=1300;
var height=7000;
var radius=50;
var velocitat=5;

var enjoc = false;
var partidaAcabada = false;
var restaurat = false;
var compteEnrere = false;
var esperaFinal = false;
var momentActualInici;
var momentActualFinal;

var Equips=[];
var llistaEspera=[];
var obstacles=[];


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
regenerarObstacles();

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


	socket.on('gotit', function(player){
		console.log('[INFO] Player ' + player.name + ' connecting!');
		if (util.findIndex(users, player.id) > -1) {
			console.log('[INFO] Player ID is already connected, kicking.');
			socket.disconnect();
		}
		else {
			console.log('[INFO] Player ' + player.name + ' connected!');
			sockets[player.id] = socket;

			player.x = 0;
			player.y = 0;
			player.target.x = 0;
			player.target.y = 0;
			currentPlayer = player;
		    currentPlayer.lastHeartbeat = new Date().getTime();
		    users.push(currentPlayer);

			
			//assigna el jugador al equip amb menys jugadors
			if(enjoc){
				currentPlayer.jugant = false;
				llistaEspera.push(currentPlayer);
			}
			else{
				currentPlayer.jugant = true;
				assignarEquip(currentPlayer);
			}
			    	
		    	
			sockets[currentPlayer.id].emit('gameSetup', {
				gameWidth: width,
				gameHeight: height
			},obstacles);
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
		
		if(!hiHaSuficientsJugadors()){
			finalCursa(0);
		}
			
		
        console.log('[INFO] User ' + currentPlayer.name + ' disconnected!');

        //socket.broadcast.emit('playerDisconnect', { name: currentPlayer.name });
	});
	
	// Heartbeat function, update everytime.
	socket.on('0', function(target) {
		currentPlayer.lastHeartbeat = new Date().getTime();
		
		var targetNormalitzada = normalitzarTarget(target,currentPlayer.x,currentPlayer.y);
		
		if (targetNormalitzada.x !== currentPlayer.target.x || targetNormalitzada.y !== currentPlayer.target.y) {
			currentPlayer.target = targetNormalitzada;
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
		if(u.jugant){
			sockets[u.id].emit('serverTellTeamMove', Equips);
		}
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
				tactual = new Date().getTime();
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
					tactual = new Date().getTime();
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
		player.jugant = true;
		assignarEquip(player);
	}
	
	regenerarObstacles();
	users.forEach(function(u){
		sockets[u.id].emit('gameSetup', {
			gameWidth: width,
			gameHeight: height
		},obstacles);
	});
}

function regenerarObstacles(){
	while(obstacles.length > 0){
		var xx = obstacles.pop();
	}
	
	crearObstacles();
	
}

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
	
	var collision = false;	

		if(nx > radius){
			if(nx < (width-radius)){
				coli = obstacleCollision(nx,ny);
				if (!coli.bool){

					team.x = nx;
				}
				else{
					collision = true;
				}
				
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
				coli = obstacleCollision(nx,ny);
				if (!coli.bool){
					team.y = ny;
				}
				else{
					var pose = coli.pose;
					if(collision && ((nx < obstacles[pose].pos.x && (ny <obstacles[pose].pos.y || ny >  (obstacles[pose].pos.y + obstacles[pose].y))) || (nx > (obstacles[pose].pos.x + obstacles[pose].x) && (ny < obstacles[pose].pos.y || ny > (obstacles[pose].pos.y + obstacles[pose].y))))){
					   	if(team.x+radius < obstacles[pose].pos.x){
					   		team.y = ny;
					   	}
					   	else if(team.x-radius > obstacles[pose].pos.x + obstacles[pose].x ){
					   		team.y = ny;
					   	}
					   	else if(team.y+radius < obstacles[pose].pos.y){
					   		team.x = nx;
					   	}
					   	else if(team.y-radius > obstacles[pose].pos.y + obstacles[pose].y ){
					   		team.x = nx;
					   	}

					}
					else{
						if(collision &&( nx < obstacles[pose].pos.x || nx > (obstacles[pose].pos.x + obstacles[pose].x))){
							team.y = ny; 
						}
				
						if(collision && (ny < obstacles[pose].pos.y || ny > (obstacles[pose].pos.y + obstacles[pose].y))){
							team.x = nx;
						}
					}
					
				}
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

function obstacleCollision(nx, ny){
	var collision = {
		bool: false,
		pose: 0
	};
	for(var i =0; i< obstacles.length; i++){
		if( nx+radius > obstacles[i].pos.x && nx-radius < (obstacles[i].pos.x + obstacles[i].x) && ny+radius > obstacles[i].pos.y && ny-radius < (obstacles[i].pos.y + obstacles[i].y)){
			collision.bool = true;
			collision.pose = i;
		}
	}
	return collision;
}

function crearObstacles(){
	
	var mq = (width/3);
	var posX = [(mq/2),(mq+(mq/2)),((2*mq)+(mq/2))];

	var n = (height - (radius * 4)) / 14;
	var posActual = height - (radius * 15);
	
	var ultimaMida = 0;
	
	while(posActual > (radius * 4)){
		var mida = Math.floor((Math.random() * 3) + 1);
		var pos = Math.floor(Math.random() * 3);
				
		if((posActual - (midaY/2)) <= (radius * 8)){
			mida = 3;
		}
		
		if(ultimaMida == 1){
			mida = 3;
		}

		var midaX = (mq-radius)/mida;
		var midaY = n/mida;
				
		var obj = {
			pos: {
				x: (posX[pos] - (midaX/2)),
				y: (posActual - (midaY/2))
			},
			x: midaX,
			y: midaY
		};
		
		obstacles.push(obj);

		if(((pos == 0) || (pos == 2)) && (mida == 3)){
			if(pos == 0){
				pos = 2;
			}
			else{ //pos == 2
				pos = 0;
			}
			
			var obj2 = {
				pos: {
					x: (posX[pos] - (midaX/2)),
					y: (posActual - (midaY/2))
				},
				x: midaX,
				y: midaY
			};
			
			obstacles.push(obj2);
		}
		
		ultimaMida = mida;
		
		posActual -= n;			
	}
}

function normalitzarTarget(target,posX,posY){
	var targetNormalitzada = {
		x: target.x,
		y: target.y
	};
	
	var norma = Math.sqrt(Math.pow(Math.abs(target.x - posX), 2) + Math.pow(Math.abs(target.y - posY), 2));
	
	targetNormalitzada.x = target.x / norma;
	targetNormalitzada.y = target.y / norma;
	
	
	return targetNormalitzada;
}

setInterval(moveloop,1000/60);
setInterval(sendUpdate,1000/40);

http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
