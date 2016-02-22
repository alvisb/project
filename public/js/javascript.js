var socket = io();
var remoteShips = [];
var remoteProjectiles = [];

socket.on("connect", onSocketConnected);
socket.on("disconnect", onSocketDisconnect);
socket.on("new player", onNewPlayer);
socket.on("update player", onUpdatePlayer);
socket.on("remove player", onRemovePlayer);


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometryBox = new THREE.BoxGeometry( 1, 1, 1 );
var materialBox = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

function randomNumber(MAX, MIN){
	var number = Math.floor((Math.random() * MAX) + MIN);
	return number;
}


var cube = new Ship( geometryBox, materialBox );
cube.setPlayerID(randomNumber(9999, 1000));
cube.position.set(randomNumber(5, 1), randomNumber(5, 1), randomNumber(5, 1) );
cube.setHealth(23);
cube.firedProjectiles = [];
//cube.setMatrix();
cube.setSpeed(0.5);
cube.add(camera);
scene.add( cube );
camera.position.z = 5;

var inputObj = new InputController();
var keysDown = [];
addEventListener("keydown", function (e) {
			keysDown[e.keyCode] = true;
		});

		addEventListener("keyup", function (e) {
			delete keysDown[e.keyCode];
		});
		
document.addEventListener("mousemove", function(e) {
		cube.rotateY (e.movementX * 0.01 *(-1));
		cube.rotateX (e.movementY * 0.01 *(-1));
})

$( "body" ).mousedown(function() {	
		cube.fireBullet();
});

var render = function () {
	requestAnimationFrame( render );
	getInput();
	socket.emit("update player", {id: cube.getPlayerID(), x: cube.position.x, y: cube.position.y, z: cube.position.z, playerMatrix: cube.matrix});
	moveProjectiles();
	renderer.render(scene, camera);
};

function getInput(){
	if ("87" in keysDown){// W
		cube.move(0, 0, -1);
	}
	if ("65" in keysDown){// A
		cube.move(-1, 0, 0);
	}
	if ("83" in keysDown){// S
		cube.move(0, 0, 1);
	}
	if ("68" in keysDown){// D
		cube.move(1, 0, 0);
	}
	if ("16" in keysDown){// SHIFT
		cube.setSpeed(1.5);
	}
	else{
		cube.setSpeed(0.5);
	}
	if("84" in keysDown){ //T for testing
		console.log("remoteShips:" + remoteShips.length);
	}
	if("73" in keysDown){ //I for ID testing
		console.log("local ship ID:" + cube.getPlayerID());
		console.log("remote ship ID:" + remoteShips[0].getPlayerID());
	}

}

function onSocketConnected() {
	console.log("scoket connected (client)");
	console.log("cube get id: " + cube.getPlayerID());
	socket.emit("new player", {id: cube.getPlayerID(), x: cube.position.x, y: cube.position.y, z: cube.position.z, playerMatrix: cube.matrix});
}
function onSocketDisconnect(data) {
    console.log("Disconnected from socket server: " + data.id);
	
};

function onNewPlayer(data) {
    console.log("New player connected: "+data.id);
	var newShip = new Ship(geometryBox, materialBox);
	
	newShip.setPlayerID(data.id);
	newShip.position.set(data.x, data.y, data.z);
 console.log("coord: " + data.x + " " + data.y + " " + data.z);
	scene.add(newShip);
	console.log("PUSDH NEW SHIP");
	remoteShips.push(newShip);
};

function onUpdatePlayer(data) {	
	var moveShip = shipById(data.id);
	console.log("move player position:" + data.playerPos);
	moveShip.position.set(data.x, data.y, data.z);
	
	//moveShip.setMatrix(data.matrix);
};

function onRemovePlayer(data){
	var removePlayer = shipById(data.id);
	console.log("remove player (clinet)");

	if (!removePlayer) {
		console.log("Player not found remove (client): "+data.id);
		return;
	};
	
	scene.remove(removePlayer);
	remoteShips.splice(remoteShips.indexOf(removePlayer), 1);
}

function onNewBullet(data) {
	var sphereMaterial = new THREE.MeshLambertMaterial( { color: "#" + Math.random().toString(16).slice(2, 8)} );
	var newProjectile = new Projectile(sphereGeo, sphereMaterial);
	
	newProjectile.id = data.idBul;
	newProjectile.setX(data.xBul);
	newBullet.setMatrix(data.matrix);
	scene.add(newBullet);
	remoteProjectiles.push(newBullet);
};

function shipById(id) {
    var i;
    for (i = 0; i < remoteShips.length; i++) {
        if (remoteShips[i].id == id)
			console.log("SUCCESS");
            return remoteShips[i];
    };
	console.log("FAILURE");
    return 0;
};

function projectileById(id) {
    var i;
    for (i = 0; i < remoteProjectiles.length; i++) {
        if (remoteProjectiles[i].id == id)
			console.log("SUCCESS");
            return remoteProjectiles[i];
    };
	console.log("FAILURE");
    return 0;
};

function moveRemoteProj(){
	for(var i = 0; i< remoteProjectiles.length; i++){
		remoteProjectiles[i].move(0, 0, -3);
	}
}


function moveProjectiles(){
	for(var i = 0; i < cube.firedProjectiles.length; i++){
		cube.firedProjectiles[i].move(0, 0, -1);
	}
}

function generateDebris(){
	for(i = 0; i < 1000; i++){
		var debrisGeometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
		var debrisMaterial = new THREE.MeshBasicMaterial( { color: 0x0000CC } );
		
		var randomX = ( Math.random() - 0.5 ) * 500;
		var randomY = ( Math.random() - 0.5 ) * 500;
		var randomZ = ( Math.random() - 0.5 ) * 500;	
		
		var debris = new THREE.Mesh( debrisGeometry, debrisMaterial );
		debris.position.x = randomX;
		debris.position.y = randomY;
		debris.position.z = randomZ;
		debris.rotation.x += randomX;
		debris.rotation.y += randomY;
		scene.add( debris );
	};
}
generateDebris();
render();