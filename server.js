var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var teamA=[];
var teamB=[];
var id=1;

app.set('port', process.env.PORT || 3000);

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/chat', function (req, res) {
	res.sendFile( __dirname + "/public/" + "chat.html" );
});

app.get('/prepartida', function (req, res) {
	res.sendFile( __dirname + "/public/" + "prepartida.html" );
})

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
	socket.on('nickname', function(nickname){
		
		var player = [id,nickname];
		socket.emit('id',id);
		id++;
		
		if(teamA.length > teamB.length){
			teamB.push(player);
			console.log(nickname+" afegit a taula B");
		}
		else if(teamB.length > teamA.length){
			teamA.push(player);
			console.log(nickname+" afegit a taula A");
		}
		else{
			var rnd = Math.floor((Math.random() * 2) + 1);
			if(rnd == 1){
				teamA.push(player);
				console.log(nickname+" afegit a taula A");
			}
			else{
				teamB.push(player);
				console.log(nickname+" afegit a taula B");
			}
		}
	});
});

http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});