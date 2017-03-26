var playerName;
var playerType = 'player';
var playerNameInput = document.getElementById('playerNameInput');
var socket;

var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

var c = document.getElementById('cvs');
var canvas = c.getContext('2d');
c.width = screenWidth; c.height = screenHeight;

var KEY_ENTER = 13;

var game = new Game();

var player = {
    id: -1,
    x: screenWidth / 2,
    y: screenHeight / 2,
    screenWidth: screenWidth,
    screenHeight: screenHeight,
    target: {x: screenWidth / 2, y: screenHeight / 2}
};
var target = {x: player.x, y: player.y};

var users =[]



//s'entrarà un cop s'hagi posat el nickname correcte i s'hagi donat al play
function startGame() {
	playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '');
	document.getElementById('gameAreaWrapper').style.display = 'block';
	document.getElementById('startMenuWrapper').style.display = 'none';
	socket = io();
	SetupSocket(socket);
	animloop();
	//socket.emit('nickname',playerName)
	socket.emit('respawn');
}
// check if nick is valid alphanumeric characters (and underscores)
function validNick() {
    var regex = /^\w*$/;
    console.log('Regex Test', regex.exec(playerNameInput.value));
    return regex.exec(playerNameInput.value) !== null;
}

window.onload = function() {
    'use strict';

    var btn = document.getElementById('startButton'),
        nickErrorText = document.querySelector('#startMenu .input-error');

    btn.onclick = function () {

        // check if the nick is valid
        if (validNick()) {
            startGame();
        } else {
            nickErrorText.style.display = 'inline';
        }
    };

    playerNameInput.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;

        if (key === KEY_ENTER) {
            if (validNick()) {
                startGame();
            } else {
                nickErrorText.style.display = 'inline';
            }
        }
    });
};

function SetupSocket(socket) {
  game.handleNetwork(socket);
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
})();

function animloop(){
    requestAnimFrame(animloop);
    gameLoop();
}

function gameLoop() {
  game.handleLogic();
  game.handleGraphics(canvas);
}

window.addEventListener('resize', function() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    c.width = screenWidth;
    c.height = screenHeight;
}, true);

window.addEventListener('resize', resize);

function resize() {
	if (!socket) return;

	player.screenWidth = c.width = screenWidth = playerType == 'player' ? window.innerWidth : gameWidth;
	player.screenHeight = c.height = screenHeight = playerType == 'player' ? window.innerHeight : gameHeight;

	/*if (global.playerType == 'spectate') {
		player.x = global.gameWidth / 2;
		player.y = global.gameHeight / 2;
	}*/

	socket.emit('windowResized', { screenWidth: screenWidth, screenHeight: screenHeight });
}
//-------------------------------------------------------------------------------------------
/* function enterKey(event){
   		if (event.keyCode == 13) {
	    		play();
			return false;	
		}
	};

function play() {
	socket.emit('nickname',document.getElementById("nickname").value);
	document.getElementById("nickname").value="";
	location.href="/chat";
};

	  
		

function leftArrowPressed() {
	var element = document.getElementById(	sessionStorage.getItem('idJugador'));
	element.style.left = parseInt(element.style.left) - 1 + '%';
	var jugador={
		id: sessionStorage.getItem('idJugador'),
		style: element.style
	}
	socket.emit("moure",jugador);

}

function rightArrowPressed() {
	var element = document.getElementById(	sessionStorage.getItem('idJugador'));
	element.style.left = parseInt(element.style.left) + 1 + '%';
	var jugador={
		id: sessionStorage.getItem('idJugador'),
		style: element.style
	}
	socket.emit("moure",jugador);

}

function upArrowPressed() {
	var element = document.getElementById(	sessionStorage.getItem('idJugador'));
	element.style.top = parseInt(element.style.top) - 1 + '%';
	var jugador={
		id: sessionStorage.getItem('idJugador'),
		style: element.style
	}
	socket.emit("moure",jugador);

}

function downArrowPressed() {
	var element = document.getElementById(sessionStorage.getItem('idJugador'));
	element.style.top = parseInt(element.style.top) + 1 + '%';
	var jugador={
		id: sessionStorage.getItem('idJugador'),
		style: element.style
	}
	socket.emit("moure",jugador);

}

function moveSelection(evt) {
	var event = window.event ? window.event : e;
	console.log(event.keyCode)
	console.log(sessionStorage.getItem('idJugador'))
	switch (evt.keyCode) {
		case 37:
			leftArrowPressed();
			break;
		case 39:
			rightArrowPressed();
			break;
		case 38:
			upArrowPressed();
			break;
		case 40:
			downArrowPressed();
			break;
	}
	
};

function docReady()
{
	var obj={
		id: sessionStorage.getItem('idJugador'),
		jugadorPrincipal: "<div id="+sessionStorage.getItem('idJugador')+" class='player' type= 'player' name='player' style =' background-color:#f220e6;position:absolute;left:50%; top:50%'>"+sessionStorage.getItem('idJugador')+"</div>"
	}
	
	socket.emit("init_pose",obj);
	
	window.addEventListener('keydown', moveSelection);
}*/

