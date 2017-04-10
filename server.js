var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Import utilities.
var util = require('./lib/util');
var users=[];
var teamA=[];
var teamB=[];
var sockets = {};
//var poses=[];
//var id=1;
var width=5000;
var height=5000;
var radius=50;

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
		}
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

	socket.on('nickname', function(nickname){
		
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
	});
	socket.on("init_pose", function(data){
		poses.push(data);
		io.emit("pose",poses);
	});
	
	socket.on("moure", function(data){
		for( i=0;i< poses.length;i++){
			if(poses[i].id==data.id){
				poses[i].jugadorPrincipal = "<div id="+data.id+" class='player' type= 'player' name='player' style =' background-color:#f220e6;position:absolute;left:"+data.style.left+"; top:"+data.style.top+"'>"+data.id+"</div>"				
			}
		}
		io.emit("movent",data);
	});


	socket.on('0', function(target) {
		currentPlayer.lastHeartbeat = new Date().getTime();
		if (target.x !== currentPlayer.x || target.y !== currentPlayer.y) {
			currentPlayer.target = target;
		}
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

			player.x = 100;
			player.y = 100;
			player.target.x = 0;
			player.target.y = 0;
			player.hue = Math.round(Math.random() * 360);
			currentPlayer = player;
		    	currentPlayer.lastHeartbeat = new Date().getTime();
		    	users.push(currentPlayer);

			//assigna el jugador al equip amb menys jugadors
			if(teamA.length > teamB.length){
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
			}
		    	
		    	
			socket.emit('gameSetup', {
				gameWidth: 5000,
				gameHeight: 5000
			});

			console.log('Total players: ' + (teamA.length + teamB.length));
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
		if (util.findIndex(teamA, currentPlayer.id) > -1){
			teamA.splice(util.findIndex(teamA, currentPlayer.id), 1);
			}
		if (util.findIndex(teamB, currentPlayer.id) > -1){
			teamB.splice(util.findIndex(teamB, currentPlayer.id), 1);
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

function mostrar(){

	console.log("\n\n\nEQUIP A:");
	for(var i=0;i<teamA.length;i++){
		var jugador = teamA[i];
		console.log(jugador.id+": "+jugador.name);
	}
	
	console.log("\nEQUIP B:");
	for(var j=0;j<teamB.length;j++){
		var jugador2 = teamB[j];
		console.log(jugador2.id+": "+jugador2.name);
	}
}

function sendUpdate(){
	users.forEach(function(u){
		sockets[u.id].emit('serverTellPlayerMove', users);
	});
}

function moveloop(){
	for(var i = 0; i < users.length; i++){
		//tickPlayer(users[i]);
		movePlayer(users[i]);
	}
}

function movePlayer(player){
	var x=0, y=0;
	
	var target = {
		x: player.x + player.target.x,
		y: player.y + player.target.y
	};
	var dist = Math.sqrt(Math.pow(target.y,2) + Math.pow(target.x,2));
	var deg = Math.atan2(target.y,target.x);
	
	console.log(player.x + ", " + player.y);
	
	var nx, ny;
	nx = Math.cos(deg) * dist;
	ny = Math.sin(deg) * dist;
	
	if((nx > radius) && (nx < (width-radius))){ 
		player.x = nx;
	}

	if((ny > radius) && (ny < (height-radius))){
		player.y = ny;
	}
}


setInterval(moveloop,100);
setInterval(sendUpdate,1000);

http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
