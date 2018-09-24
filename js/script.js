//XML String
var xmlString = "";

//"Global" variables
var player1;
var player2;

//Load Google Charts API
google.charts.load('current', {'packages':['line']});
var shouldDrawChart = false;

//Chart data
var playersTime = [];
var player1ArmyValue = [];
var player2ArmyValue = [];
var player1Army = 0;
var player2Army = 0;
var player1EcoArray = [];
var player2EcoArray = [];
var player1Eco = 0;
var player2Eco = 0;

//Get XML String
window.onload = function() {
var fileInput = document.getElementById("xmlInput");
	fileInput.addEventListener('change', function(e) {
		var file = fileInput.files[0];
		var textType = /text.xml/;
		if (file.type.match(textType)) {
			var reader = new FileReader();
			reader.onload = function(e) {
				xmlString = reader.result;
			}
			reader.readAsText(file);
		}
	});
}

//Check if XML code is ready
function checkXml() {
	if (xmlString.length == 0) {
		alert("Add a replay file to analyse it!");
	} else {
		doXml();
	}
}

//Do XML code
function doXml() {

	//xmlString = $("#xmlInfo").val(),
	xmlDoc = $.parseXML(xmlString),
	$xml = $(xmlDoc),
	$matchType = $xml.find( "MissionType" ) //Match Type
	$matchTime = $xml.find( "MatchTime" ) //Match Time
	$matchPlayer = $xml.find( "Identity" ) //Match Player
	$matchWinnerTeam = $xml.find( "WinningTeam" ) //Match Winner Team
	$matchDeck = $xml.find( "Cards" ) //Match Deck
	$matchBuild = $xml.find( "GameEvents" ) //Build Orders
	$worldSeed = $xml.find( "WorldSeed" )  //World Seed
	;

	//Match Type
	var matchTypeText =  $matchType.text();
	if (matchTypeText == "PVPFFA_2P") {
		matchTypeText = "PvP - Free For All - 2 players";
	}
	$("#MatchType").children("p").text( matchTypeText );
	//------------------------------------------

	//Match Time
	var matchTime = parseInt( $matchTime.text() );
	var matchTimeM = Math.floor(matchTime / 60) + "";
	var matchTimeS = Math.floor(matchTime % 60) + "";
	var matchTimeText = matchTimeM + " minutes, " + matchTimeS + " seconds";
	$("#MatchTime").children("p").text( matchTimeText );
	//------------------------------------------

	//Match Winner and statistics
	player1 = $matchPlayer.eq(0).attr("Name");
	var player1ID = $matchPlayer.eq(0).attr("Id");
	player2 = $matchPlayer.eq(1).attr("Name");
	var player2ID = $matchPlayer.eq(1).attr("Id");

	//Empty Deck
	$("#Player1Deck tbody").empty();
	$("#Player1Deck tbody").append("<tr></tr>");
	$("#Player2Deck tbody").empty();
	$("#Player2Deck tbody").append("<tr></tr>");

	for (var i = 0; i < $matchDeck.eq(0).find("Card").length; i++) {
		var text = $matchDeck.eq(0).find("Card").eq(i).attr("Data");
		var imageFile = "img/" + text + ".png";
		text = fixNames(text);
		var deck = "<tr><td>" + text + "</td><td><img height='50px' width='50px' src='" + imageFile + "'></td</tr>";
		$("#Player1Deck tbody tr").last().after(deck);
	}
	for (var i = 0; i < $matchDeck.eq(1).find("Card").length; i++) {
		var text = $matchDeck.eq(1).find("Card").eq(i).attr("Data");
		var imageFile = "img/" + text + ".png";
		text = fixNames(text);
		var deck = "<tr><td>" + text + "</td><td><img height='50px' width='50px' src='" + imageFile + "'></td</tr>";
		$("#Player2Deck tbody tr").last().after(deck);
	}

	var winningTeam = parseInt($matchWinnerTeam.text());
	$("#Player1").children("p").html("ID: " + player1ID);
	$("#Player1").children("h3").text(player1);
	$("#Player2").children("p").html("ID: " + player2ID);
	$("#Player2").children("h3").text(player2);
	$("#Winnter").children("p").text( winningTeam == 1 ? player1 : player2 );
	//------------------------------------------

	//Empty Build Order and chart data
	playersTime = [];
    player1ArmyValue = [];
    player2ArmyValue = [];
	player1Army = 0;
	player2Army = 0;
	player1EcoArray = [];
	player2EcoArray = [];
	player1Eco = 0;
	player2Eco = 0;
	$("#BuildOrder tbody").empty();
	$("#BuildOrder tbody").append("<tr></tr>");
	$("#BuildOrder2 tbody").empty();
	$("#BuildOrder2 tbody").append("<tr></tr>");
	//Build Order and chart data
	var matchBuildOrderLength = $matchBuild.find("g").length;
	var bOO = $matchBuild.find("g");
	for (var i = 0; i < matchBuildOrderLength; i++) {

		//Sets print to build order list as true
		var print = true;

		//Checks witch player we are analysing
		var p = parseInt(bOO.eq(i).attr("p")) == 1 ? player1 : player2;
		
		//If the action is Die och Procude we won't print it to the build order
		var e = bOO.eq(i).attr("e");
		if (e == "Die" || e == "Produce") {
			//continue;
			print = false;
		}
		//Get all other data
		var t = parseInt(bOO.eq(i).attr("t")); //Time data
		t /= 30; //Redo time data to seconds
		var chartT = t; //Sets the chartT to the t
		var tM = Math.floor(t / 60); //Creates time in minutes
		var tS = Math.floor(t % 60); //Creates time in seconds
		t = tM + " min<br>" + tS + " sec" //Recreates the time data to a time string
		var d = bOO.eq(i).attr("d"); //Gets the Type of action
		var imageFile = "img/" + d + ".png"; //Sets a image file link to the type of action
		unfixD = d; //Saves the Type of action unfixed
		d = fixNames(d); //Fixes the name for use as a string
		//If the file link is these, change them to empty.png
		if (imageFile == "img/structure_campfire.png" || imageFile == "img/structure_gristmill.png") {
			imageFile = "img/empty.png";
		}

		//Creates the string to add to the Build Order table
		if (e == "Sell") {
			var buildOrder = "<tr><td>" + t + "</td><td>Sold - " + d + "</td><td><img height='50px' width='50px' src='" + imageFile + "'></td</tr>";
		} else {
			var buildOrder = "<tr><td>" + t + "</td><td>" + d + "</td><td><img height='50px' width='50px' src='" + imageFile + "'></td</tr>";
		}
		
		//Add the build order string to the tables
		if (p == player1 && print) {
			$("#BuildOrder tbody tr").last().after(buildOrder);
		} else if (p == player2 && print) {
			$("#BuildOrder2 tbody tr").last().after(buildOrder);
		}

		//Fixes data to chart
		if (p == player1) {
			//Army Quantity
			if (e == "Produce" && unfixD != "pig") {
				player1Army++;
			} else if (e == "Die" && unfixD != "pig" && unfixD != "commander_capitalists" && unfixD.indexOf("structure_") == -1 && unfixD.indexOf("warren_") == -1) {
				player1Army--;
			}
			//Income Structures
			if (e == "Build" && unfixD == "structure_farm" || unfixD == "structure_campfire") {
				player1Eco++;
			} else if ( (e == "Die" && unfixD == "structure_farm" || unfixD == "structure_campfire") || (e == "Sell" && unfixD == "structure_farm" || unfixD == "structure_campfire") ) {
				player1Eco--;
			}
		}
		else if (p == player2) {
			//Army Quantity
			if (e == "Produce" && unfixD != "pig") {
				player2Army++;
			} else if (e == "Die" && unfixD != "pig" && unfixD != "commander_capitalists" && unfixD.indexOf("structure_") == -1 && unfixD.indexOf("warren_") == -1) {
				player2Army--;
			}
			//Income Structures
			if (e == "Build" && unfixD == "structure_farm" || unfixD == "structure_campfire") {
				player2Eco++;
			} else if ( (e == "Die" && unfixD == "structure_farm" || unfixD == "structure_campfire") || (e == "Sell" && unfixD == "structure_farm" || unfixD == "structure_campfire") ) {
				player2Eco--;
			}
		}
		//Fixe future, undetected, chart data problem
		if (player1Army < 0) {
			player1Army = 0;
		}
		if (player2Army < 0) {
			player2Army = 0;
		}
		if (player1Eco < 0) {
			player1Eco = 0;
		}
		if (player2Eco < 0) {
			player2Eco = 0;
		}
		playersTime[playersTime.length] = chartT;
		player1ArmyValue[player1ArmyValue.length] = player1Army;
		player2ArmyValue[player2ArmyValue.length] = player2Army;
		player1EcoArray[player1EcoArray.length] = player1Eco;
		player2EcoArray[player2EcoArray.length] = player2Eco;
	}
	//Draws the chart
	google.charts.setOnLoadCallback(drawChart);
	google.charts.setOnLoadCallback(drawChart2);
	//console.log( $matchBuild.find("g").eq(0).attr("e") );
	//------------------------------------------

	//World Seed
	$("#WorldSeed").children("p").text( $worldSeed.text() );
	//------------------------------------------

	//Fix display
	fix();
}

//Fix display
function fix() {
	$("#BuildOrder").css("height","");
	$("#BuildOrder2").css("height","");
	//Fix Build Order height
	var b1 = $("#BuildOrder").outerHeight();
	var b2 = $("#BuildOrder2").outerHeight();

	if (b1 > b2) {
		$("#BuildOrder2").css("height", b1 + "px");
	} else if (b2 > b1) {
		$("#BuildOrder").css("height", b2 + "px");
	}
	//------------------------------------------
}

//Fix names
function fixNames(str) {
	str += "";
	var warren = "warren_";
	var structure = "structure_";

	if ( str.indexOf(warren) != -1 ) {
		str = str.replace(warren, "");
		str = str.charAt(0).toUpperCase() + str.slice(1);

	} else if ( str.indexOf(structure) != -1 ) {
		str = str.replace(structure, "");
		str = str.charAt(0).toUpperCase() + str.slice(1);

	}
	return str;
}

function checkDrawChart() {
	if (shouldDrawChart) {
		drawChart();
		drawChart2();
	}
}

function drawChart() {
	
	shouldDrawChart = true;

	var data = new google.visualization.DataTable();
	data.addColumn('number', ' ');
	data.addColumn('number', player1);
	data.addColumn('number', player2);
	
	//For loop that adds all of the data
	for (var i = 0; i < playersTime.length; i++) {
		data.addRow([
			playersTime[i], player1ArmyValue[i], player2ArmyValue[i]
		]);
	}
	
	var options = {
		chart: { title: " " },
		legend: { position: "bottom" },
		backgroundColor: '#d9d9d9'
	};
	var chart = new google.charts.Line(document.getElementById("theChart"));
	chart.draw(data, google.charts.Line.convertOptions(options));
}
function drawChart2() {

	var data = new google.visualization.DataTable();
	data.addColumn('number', ' ');
	data.addColumn('number', player1);
	data.addColumn('number', player2);
	
	//For loop that adds all of the data
	for (var i = 0; i < playersTime.length; i++) {
		data.addRow([
			playersTime[i], player1EcoArray[i], player2EcoArray[i]
		]);
	}
	
	var options = {
		chart: { title: " " },
		legend: { position: "bottom" },
		backgroundColor: '#d9d9d9'
	};
	var chart = new google.charts.Line(document.getElementById("theOtherChart"));
	chart.draw(data, google.charts.Line.convertOptions(options));
}