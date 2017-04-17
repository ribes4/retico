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
		player.target = canvas.target;
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
		//disconnected = true;
	});

	socket.on('disconnect', function () {
		socket.close();
		//disconnected = true;
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
			player.hue = playerData.hue;
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

Game.prototype.handleGraphics = function() {
	// This is where you draw everything
	graph.fillStyle = '#fbfcfc';
	graph.fillRect(0, 0, screenWidth, screenHeight);
	
	drawgrid();
	drawMarge();
	
	graph.fillStyle = '#2ecc71';
	graph.strokeStyle = '#27ae60';
	graph.font = 'bold 50px Verdana';
	graph.textAlign = 'center';
	graph.lineWidth = 2;
	graph.fillText('Retico under construction...', screenWidth / 2, screenHeight / 2);
	graph.strokeText('Retico under construction...', screenWidth / 2, screenHeight / 2);
	
	drawPlayers();
        socket.emit('0', canvas.target); // playerSendTarget "Heartbeat".
}

//construeix la graella del fons
function drawgrid() {
     graph.lineWidth = 1;
     graph.strokeStyle = '#000000';
     graph.globalAlpha = 0.15;
     graph.beginPath();

    for (var x = -0 - player.x; x < screenWidth; x += screenHeight / 18) {
        graph.moveTo(x, 0);
        graph.lineTo(x, window.screenHeight);
    }

    for (var y = -0 - player.y ; y < screenHeight; y += screenHeight / 18) {
        graph.moveTo(0, y);
        graph.lineTo(window.screenWidth, y);
    }

    graph.stroke();
    graph.globalAlpha = 1;
}

function drawMarge(){
	var lineColor = '#000000';
	graph.lineWidth = 1;
	graph.strokeStyle = playerConfig.borderColor;

	// Left-vertical.
	if (player.x <= screenWidth/2) {
		graph.beginPath();
		graph.moveTo(screenWidth/2 - player.x, 0 ? player.y > screenHeight/2 : screenHeight/2 - player.y);
		graph.lineTo(screenWidth/2 - player.x, gameHeight + screenHeight/2 - player.y);
		graph.strokeStyle = lineColor;
		graph.stroke();
	}

	// Top-horizontal.
	if (player.y <= screenHeight/2) {
		graph.beginPath();
		graph.moveTo(0 ? player.x > screenWidth/2 : screenWidth/2 - player.x, screenHeight/2 - player.y);
		graph.lineTo(gameWidth + screenWidth/2 - player.x, screenHeight/2 - player.y);
		graph.strokeStyle = lineColor;
		graph.stroke();
	}

	// Right-vertical.
	if (gameWidth - player.x <= screenWidth/2) {
		graph.beginPath();
		graph.moveTo(gameWidth + screenWidth/2 - player.x,
		screenHeight/2 - player.y);
		graph.lineTo(gameWidth + screenWidth/2 - player.x,
		gameHeight + screenHeight/2 - player.y);
		graph.strokeStyle = lineColor;
		graph.stroke();
	}

	// Bottom-horizontal.
	if (gameHeight - player.y <= screenHeight/2) {
		graph.beginPath();
		graph.moveTo(gameWidth + screenWidth/2 - player.x,
		gameHeight + screenHeight/2 - player.y);
		graph.lineTo(screenWidth/2 - player.x,
		gameHeight + screenHeight/2 - player.y);
		graph.strokeStyle = lineColor;
		graph.stroke();
	}

}

function drawPlayers() {
	var start = {
		x: player.x - (screenWidth / 2),
		y: player.y - (screenHeight / 2)
	};

	for(var z=0; z<users.length; z++){
		var userCurrent = users[z];

		var x = 0;
		var y = 0;

		var points = 30 + ~~(30/5);
		var increase = Math.PI * 2 / points;

		graph.strokeStyle = 'hsl(' + userCurrent.hue + ', 100%, 45%)';
		graph.fillStyle = 'hsl(' + userCurrent.hue + ', 100%, 50%)';
		graph.lineWidth = playerConfig.border;

		var xstore = [];
		var ystore = [];


		spin +=0.0;
		var radius = 50

		var circle = {
		    x: userCurrent.x - start.x,
		    y: userCurrent.y - start.y
		};

		for (var i = 0; i < points; i++) {
		    x = radius * Math.cos(spin) + circle.x;
		    y = radius * Math.sin(spin) + circle.y;

		    x = valueInRange(-userCurrent.x + screenWidth / 2,
			 gameWidth - userCurrent.x + screenWidth / 2, x);
		    y = valueInRange(-userCurrent.y + screenHeight / 2,
         		 gameHeight - userCurrent.y + screenHeight / 2, y);
		
	  	    /*x = valueInRange(-cellCurrent.x - player.x + screenWidth / 2 + (radius/3),
				                 gameWidth - cellCurrent.x + gameWidth - player.x + screenWidth / 2 - (radius/3), x);
		    y = valueInRange(-cellCurrent.y - player.y + screenHeight / 2 + (radius/3),
				                 gameHeight - cellCurrent.y + gameHeight - player.y + screenHeight / 2 - (radius/3) , y);
*/
		    spin += increase;
		    xstore[i] = x;
		    ystore[i] = y;
		}
		for (i = 0; i < points; ++i) {
		    if (i === 0) {
		        graph.beginPath();
		        graph.moveTo(xstore[i], ystore[i]);
		    } else if (i > 0 && i < points - 1) {
		        graph.lineTo(xstore[i], ystore[i]);
		    } else {
		        graph.lineTo(xstore[i], ystore[i]);
		        graph.lineTo(xstore[0], ystore[0]);
		    }

		}
		graph.lineJoin = 'round';
		graph.lineCap = 'round';
		graph.fill();
		graph.stroke();
		var nameCell = "";
		if(typeof(userCurrent.id) == "undefined")
		    nameCell = player.name;
		else
		    nameCell = userCurrent.name;

		var fontSize = Math.max(radius / 3, 12);
		graph.lineWidth = playerConfig.textBorderSize;
		graph.fillStyle = playerConfig.textColor;
		graph.strokeStyle = playerConfig.textBorder;
		graph.miterLimit = 1;
		graph.lineJoin = 'round';
		graph.textAlign = 'center';
		graph.textBaseline = 'middle';
		graph.font = 'bold ' + fontSize + 'px sans-serif';


		graph.strokeText(nameCell, circle.x, circle.y);
		graph.fillText(nameCell, circle.x, circle.y);



	}
	
	//....
	
}

function valueInRange(min, max, value) {
    return Math.min(max, Math.max(min, value));
}

