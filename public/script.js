var teamA = [];
var teamB = [];
var id = 1;
var idJugador=0;

function myFunction() {
	//document.getElementById("text2").innerHTML = document.getElementById("inputButton").value;
	var player = [id, document.getElementById("nickname").value];
	idJugador = player[0];
	id++;

	if(teamA.length > teamB.length){
		teamB.push(player);
	}
	else if(teamB.length > teamA.length){
		teamA.push(player);
	}
	else{
		var rnd = Math.floor((Math.random() * 2) + 1);
		if(rnd == 1){
			teamA.push(player);
		}
		else{
			teamB.push(player);
		}
	}
	
	document.getElementById("nickname").value="";
	location.href="/chat";
	
};