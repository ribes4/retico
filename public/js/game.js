function Game() { };

Game.prototype.handleNetwork = function(socket) {
	console.log('Game connection process here');
	console.log(socket);
// This is where you receive all socket messages

	socket.on('welcome', function(playerSettings){
		player = playerSettings;
		//sessionStorage.setItem('idJugador',id);
		//player.id = id;
		player.name = playerName;
		player.screenWidth = screenWidth;
		player.screenHeight = screenHeight;
		player.target = target;
		alert("La teva id: "+ player.id + " i el teu nick: "+ playerName);

		socket.emit('gotit', player);
	});
	/*
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
		$("#"+ data.id).css(move);
	});
	*/ 

	// Handle error.
	socket.on('connect_failed', function () {
		socket.close();
		//global.disconnected = true;
	});

	socket.on('disconnect', function () {
		socket.close();
		//global.disconnected = true;
	});

	socket.on('gameSetup', function(data) {
		gameWidth = data.gameWidth;
		gameHeight = data.gameHeight;
		resize();
	});

	socket.on('serverTellPlayerMove', function (userData){
		var playerData;
		for(var i=0; i < userData.length; i++){
			//console.log("typeee: "+typeof(userData[i].id));
			//if(typeof(userData[i].id) == "undefined"){
			playerData = userData[i];
			i = userData.length;
			//}
		}
		if(playerType == 'player'){
			var xoffset = player.x - playerData.x;
			var yoffset = player.y - playerData.y;

			player.x = playerData.x;
			player.y = playerData.y;
			player.xoffset = isNaN(xoffset) ? 0 : xoffset;
			player.yoffset = isNaN(yoffset) ? 0 : yoffset;
		}
		users = userData;
	});
}

Game.prototype.handleLogic = function() {
  console.log('Game is running');
  // This is where you update your game logic
}

Game.prototype.handleGraphics = function(gfx) {
	// This is where you draw everything
	gfx.fillStyle = '#fbfcfc';
	gfx.fillRect(0, 0, screenWidth, screenHeight);
	
	drawgrid();
	//TODO dibuixar border
	
	gfx.fillStyle = '#2ecc71';
	gfx.strokeStyle = '#27ae60';
	gfx.font = 'bold 50px Verdana';
	gfx.textAlign = 'center';
	gfx.lineWidth = 2;
	gfx.fillText('Retico under construction...', screenWidth / 2, screenHeight / 2);
	gfx.strokeText('Retico under construction...', screenWidth / 2, screenHeight / 2);
	
	drawPlayers();
        socket.emit('0', target); // playerSendTarget "Heartbeat".
}

//construeix la graella del fons
function drawgrid() {
     canvas.lineWidth = 1;
     canvas.strokeStyle = '#000000';
     canvas.globalAlpha = 0.15;
     canvas.beginPath();

    for (var x = -0 - window.screenWidth / 2; x < window.screenWidth; x += window.screenHeight / 18) {
        canvas.moveTo(x, 0);
        canvas.lineTo(x, window.screenHeight);
    }

    for (var y = -0 - window.screenHeight / 2 ; y < window.screenHeight; y += window.screenHeight / 18) {
        canvas.moveTo(0, y);
        canvas.lineTo(window.screenWidth, y);
    }

    canvas.stroke();
    canvas.globalAlpha = 1;
}

function drawPlayers() {
	var start = {
		x: player.x - (screenWidth / 2),
		y: player.y - (screenHeight / 2)
	};
	console.log('---------------Showing list of players---------------');
	for(var z=0; z<users.length; z++){
		console.log("player: "+ users[z].id);
	}
	
	//....
}
