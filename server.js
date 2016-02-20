var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var remoteEntity = require("./RemoteEntity").RemoteEntity;
var players = [];
var remoteProjectiles = [];

function init(){
	
	app.use(express.static(__dirname + '/public'));

	app.get('/', function(req, res){
	  res.sendFile('index.html');
	});

	http.listen(process.env.PORT || 3000, function(){
	  console.log('listening on *:3000');
	});

	setEventHandlers();
}


var setEventHandlers = function() {
    io.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
    console.log("New player has connected: "+client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("update player", onUpdatePlayer);

};

function onClientDisconnect() {
    console.log("Player has disconnected: "+this.id);
	
	var removePlayer = playerById(this.id);

	if (!removePlayer) {
		console.log("Player not found: remove(server)"+this.id);
		return;
	};

	players.splice(players.indexOf(removePlayer), 1);
	this.broadcast.emit("reupdate player", {id: this.id});
};


function onNewPlayer(data) {
	var newPlayer = new remoteEntity();
	newPlayer.id = this.id;
	this.broadcast.emit("new player", {id: newPlayer.id, playerPos: newPlayer.getPosition(), playerMatrix: newPlayer.getMatrix()});
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
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
	this.broadcast.emit("update player", {id: movePlayer.id, playerPos: movePlayer.getPosition(), playerMatrix: movePlayer.getMatrix()});
};

function onNewProjectile(data) {
	var newProjectile = new RemoteEntity(data.xBul, data.zBul);
	newProjectile.id = this.id;
	this.broadcast.emit("new bullet", {idBul: newProjectile.id, xBul: newProjectile.getX(), zBul: newProjectile.getZ(), bulRot: newProjectile.getRotation()});
	
	if(remoteProjectiles.length < 8){
		remoteProjectiles.push(newProjectile);
	}
};

function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    };

    return false;
};

function projectileById(id) {
    var i;
    for (i = 0; i < remoteProjectiles.length; i++) {
        if (remoteProjectiles[i].id == id)
            return remoteProjectiles[i];
    };

    return false;
};

init();