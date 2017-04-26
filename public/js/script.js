var playerName;
var playerType = 'player';
var playerNameInput = document.getElementById('playerNameInput');
var socket;

var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var gameWidth;
var gameHeight;

var KEY_ENTER = 13;
var KEY_LEFT= 37;
var KEY_UP = 38;
var KEY_RIGHT= 39;
var KEY_DOWN= 40;
var game = new Game();

var player = {
    id: -1,
    x: screenWidth / 2,
    y: screenHeight / 2,
    screenWidth: screenWidth,
    screenHeight: screenHeight,
    target: {x: screenWidth / 2, y: screenHeight / 2},
    team: 0
};
var target = {x: player.x, y: player.y};
var continuity = true;
var partidaAcabada = false;
var winner = false;
var youAreFirst = false;
var go = true;
var countdown = 10;
var teams =[]

var playerConfig = {
    border: 6,
    textColor: '#FFFFFF',
    textBorder: '#000000',
    textBorderSize: 3,
    defaultSize: 30
};
var spin = -Math.PI;

var canvas = new Canvas();
var c = canvas.cv;
var graph = c.getContext('2d');


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
	canvas.socket = socket;

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
  game.handleGraphics();
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

