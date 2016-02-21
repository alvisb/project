var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var RemoteEntity = require("./RemoteEntity").RemoteEntity;
var players;

function init(){
	players = [];
	app.use(express.static(__dirname + '/public'));

	app.get('/', function(req, res){
	  res.sendFile('index.html');
	});

	http.listen(process.env.PORT || 3000, function(){
	  console.log('listening on *:3000'  + process.env.PORT);
	});

	setEventHandlers();
}


var setEventHandlers = function() {
    io.on("connection", onSocketConnection);
};

function onSocketConnection(socket) {
    console.log("New player has connected (server): "+socket.id);
    socket.on("disconnect", onSocketDisconnect);
    socket.on("new player", onNewPlayer);
    socket.on("update player", onUpdatePlayer);
};

function onSocketDisconnect() {
    console.log("Player has disconnected (server): "+this.id);
	
	var removePlayer = playerById(this.id);

	if (!removePlayer) {
		console.log("Player not found: remove(server)"+this.id);
		return;
	};

	players.splice(players.indexOf(removePlayer), 1);
	this.broadcast.emit("remove player", {id: this.id});
};


function onNewPlayer(data) {
	console.log("new player (server)");
	var newPlayer = new RemoteEntity(data.playerPos);
	newPlayer.id = this.id;
	this.broadcast.emit("new player", {id: newPlayer.id, playerPos: newPlayer.getPosition(), playerMatrix: newPlayer.getMatrix()});
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		console.log("existing player");
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, playerPos: existingPlayer.getPosition(), playerMatrix: existingPlayer.getMatrix()});
	};
	players.push(newPlayer);
};

function onUpdatePlayer(data) {
	var movePlayer = playerById(this.id);

	if (!movePlayer) {
		console.log("Player not found move(server): "+this.id);
		return;
	};
	movePlayer.setPosition(data.playerPos);
	movePlayer.setMatrix(data.playerMatrix);
	this.broadcast.emit("update player", {id: movePlayer.id, playerPos: 5, playerMatrix: movePlayer.getMatrix()});
};


function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    };

    return false;
};


init();