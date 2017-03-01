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




	socket.on('gotit', function(player){
		console.log('[INFO] Player ' + player.name + ' connecting!');
		if (util.findIndex(users, player.id) > -1) {
			console.log('[INFO] Player ID is already connected, kicking.');
			socket.disconnect();
		}
		else {
			console.log('[INFO] Player ' + player.name + ' connected!');
			//sockets[player.id] = socket;

			player.x = 0;
			player.y = 0;
			player.target.x = 0;
			player.target.y = 0;
	
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
});

function mostrar(){

	console.log("\n\n\n\n\nEQUIP A:");
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

http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
