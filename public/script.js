function myFunction() {
	    document.getElementById("text2").innerHTML = document.getElementById("inputButton").value;
};

function enterKey(event){
   		if (event.keyCode == 13) {
	    		document.getElementById("text2").innerHTML = document.getElementById("inputButton").value;
			return false;	
		}
	};