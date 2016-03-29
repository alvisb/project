var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gameloop = require('node-gameloop');
var MongoClient = require('mongodb').MongoClient;

var RemoteEntity = require("./RemoteEntity").RemoteEntity;
var Player = require("./public/js/Player").Player;
var playerShips;
var players = [];
var existingRooms = [];
var projectiles;
var asteroids = [];
var port = 3000;

//HARDCODED DATA FOR TESTING

var testPlayer = new Player();
testPlayer.setUsername("alvisss");
testPlayer.setID("1234");
testPlayer.password = "password"

//HARDCODED DATA FOR TESTING

function init(){
	playerShips = [];
	projectiles = [];
	app.use(express.static(__dirname + '/public'));

	app.get('/', function(req, res){
	  res.sendFile('index.html');
	});

	http.listen(process.env.PORT || port, function(){
	  console.log('listening on port: ' + port);
	});
	createAsteroidData()
	setEventHandlers();
	
	MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
	if(!err) {
		console.log("We are connected");
	}
	
	db.createCollection('test', {strict:true}, function(err, collection) {});
	
});
	
}

function randomNumber(MAX, MIN){
	var number = Math.floor((Math.random() * MAX) + MIN);
	return number;
};

var setEventHandlers = function() {
    io.on("connection", onSocketConnection);
};

function onSocketConnection(socket) {
    console.log("New player has connected: "+socket.id);
	checkExistingRooms();
    socket.on("disconnect", onSocketDisconnect);
    socket.on("new player", onNewPlayer);
    socket.on("update player", onUpdatePlayer);
	socket.on("new projectile", onNewProjectile);
	socket.on("generate asteroids", onGenerateAsteroids);
	socket.on("update asteroids", onUpdateAsteroids);
	//ROOMS
	socket.on("create room", onCreateRoom);
};

function checkExistingRooms(){
	for (i = 0; i < existingRooms.length; i++) {
		existingRoom = existingRooms[i];
		io.emit("add room", {roomName: existingRoom});
	};
}

function onCreateRoom(data){
	this.join(data.roomName);
	console.log("New player has joined room: "+this.id);
	console.log("Room: " + data.roomName);
	this.emit("add room", {roomName: data.roomName});
	existingRooms.push(data.roomName);
}

function onSocketDisconnect() {
    console.log("Player has disconnected: "+this.id);
	
	var removePlayer = playerById(this.id);

	if (!removePlayer) {
		console.log("Player not found: remove(server)"+this.id);
		return;
	};

	playerShips.splice(playerShips.indexOf(removePlayer), 1);
	this.broadcast.emit("remove player", {id: this.id});
};

function createAsteroidData(){
	for(i = 0; i < 100; i++){
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
		
		asteroid.explosive = randomNumber(11, 1);
		
		asteroids.push(asteroid);
	};
}

function onUpdateAsteroids(){
	
}

function onGenerateAsteroids(){
	
	this.emit("generate asteroids", {asteroidArray: asteroids});
  
}


function onNewPlayer(data) {
	var newPlayer = new RemoteEntity(data.x, data.y, data.z);
	newPlayer.setMatrix(data.playerMatrix);
	newPlayer.id = this.id;
	this.broadcast.emit("new player", {id: newPlayer.id, playerMatrix: newPlayer.getMatrix()});
	var i, existingPlayer;
	for (i = 0; i < playerShips.length; i++) {
		existingPlayer = playerShips[i];
		this.emit("new player", {id: existingPlayer.id, playerMatrix: existingPlayer.getMatrix()});
	};
	playerShips.push(newPlayer);
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
    for (i = 0; i < playerShips.length; i++) {
        if (playerShips[i].id == id)
            return playerShips[i];
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