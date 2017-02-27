var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var teamA=[];
var teamB=[];
var poses=[];
var id=1;


app.set('port', process.env.PORT || 3000);

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/chat', function (req, res) {
	res.sendFile( __dirname + "/public" + "/chat.html" );
});

app.get('/prepartida', function (req, res) {
	res.sendFile( __dirname + "/public" + "/prepartida.html" );
})

io.on('connection', function(socket){

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
		player.x = 0;
		player.y = 0;
		player.target.x = 0;
		player.target.y = 0;
		
		socket.emit('gameSetup', {
			gameWidth: 5000,
			gameHeight: 5000
		});
		console.log('Total players: ' + (teamA.length + teamB.length));
	});
	
	socket.on('windowResized', function (data) {
		//currentPlayer.screenWidth = data.screenWidth;
		//currentPlayer.screenHeight = data.screenHeight;
    });
});

function mostrar(){

	console.log("\n\n\n\n\nEQUIP A:");
	for(var i=0;i<teamA.length;i++){
		var jugador = teamA[i];
		console.log(jugador[0]+": "+jugador[1]);
	}
	
	console.log("\nEQUIP B:");
	for(var j=0;j<teamB.length;j++){
		var jugador2 = teamB[j];
		console.log(jugador2[0]+": "+jugador2[1]);
	}
}

http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
