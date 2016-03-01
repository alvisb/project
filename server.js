var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gameloop = require('node-gameloop');

var RemoteEntity = require("./RemoteEntity").RemoteEntity;
var players;
var projectiles;
var asteroids = [];

function init(){
	players = [];
	projectiles = [];
	app.use(express.static(__dirname + '/public'));

	app.get('/', function(req, res){
	  res.sendFile('index.html');
	});

	http.listen(process.env.PORT || 3000, function(){
	  console.log('listening on *:3000'  + process.env.PORT);
	});
	createAsteroidData()
	setEventHandlers();
	
}

function randomNumber(MAX, MIN){
	var number = Math.floor((Math.random() * MAX) + MIN);
	return number;
};

var setEventHandlers = function() {
    io.on("connection", onSocketConnection);
};

function onSocketConnection(socket) {
    console.log("New player has connected (server): "+socket.id);
    socket.on("disconnect", onSocketDisconnect);
    socket.on("new player", onNewPlayer);
    socket.on("update player", onUpdatePlayer);
	socket.on("new projectile", onNewProjectile);
	socket.on("generate asteroids", onGenerateAsteroids);
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

function createAsteroidData(){
	for(i = 0; i < 1000; i++){
		//var debrisGeometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
		//var debrisMaterial = new THREE.MeshLambertMaterial( { color: 0x0000CC } );
		var asteroid = new Object();
		
		asteroid.posX = randomNumber(65000, -65000);
		asteroid.posY = randomNumber(10000, -5000);
		asteroid.posZ = randomNumber(10000, -5000);
		
		asteroid.rotX = randomNumber(10, 1);
		asteroid.rotY = randomNumber(10, 1);
		asteroid.rotZ = randomNumber(10, 1);
		
		asteroid.scaleX = randomNumber(100, 30);
		asteroid.scaleY = randomNumber(100, 30);
		asteroid.scaleZ = randomNumber(100, 30);
		
		asteroid.rotAmount = randomNumber(5, 1);
		asteroid.speed = randomNumber(15, 1) * 0.1;
		
		asteroids.push(asteroid);
	};
}

function updateAsteroids(){
	var loop = true;
	while(loop == true){
		for(var i = 0; i < asteroids.length; i++){
			asteroids[i].rotX += 0.01;
			asteroids[i].posX += asteroids[i].speed;
		}
	}
}

function onGenerateAsteroids(){
	
	this.emit("generate asteroids", {asteroidArray: asteroids});
  
}


function onNewPlayer(data) {
	var newPlayer = new RemoteEntity(data.x, data.y, data.z);
	newPlayer.setMatrix(data.playerMatrix);
	console.log("coord(server): " + data.x + " " + data.y + " " + data.z);
	newPlayer.id = this.id;
	this.broadcast.emit("new player", {id: newPlayer.id, playerMatrix: newPlayer.getMatrix()});
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		console.log("existing player");
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, playerMatrix: existingPlayer.getMatrix()});
	};
	players.push(newPlayer);
};

function onUpdatePlayer(data) {
	var movePlayer = playerById(this.id);

	if (!movePlayer) {
		//console.log("Player not found move(server): "+data.id);
		return;
	};
	//console.log(" move coord(server): " + data.x + " " + data.y + " " + data.z);

	movePlayer.setMatrix(data.playerMatrix);
	movePlayer.id = this.id;
	this.broadcast.emit("update player", {id: movePlayer.id, playerMatrix: movePlayer.getMatrix()});
};

function onNewProjectile(data) {
	
	var newProjectile = new RemoteEntity(data.x, data.y, data.z);
	newProjectile.setMatrix(data.projectileMatrix);
	newProjectile.id = this.id;
	this.broadcast.emit("new projectile", {id: newProjectile.id, projectileMatrix: newProjectile.getMatrix()});

	//projectiles.push(newProjectile);
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
    for (i = 0; i < projectiles.length; i++) {
        if (projectiles[i].id == id)
            return projectiles[i];
    };

    return false;
};


init();