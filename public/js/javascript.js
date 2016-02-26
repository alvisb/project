var socket = io();
var remoteShips = [];
var remoteProjectiles = [];

socket.on("connect", onSocketConnected);
socket.on("disconnect", onSocketDisconnect);
socket.on("new player", onNewPlayer);
socket.on("update player", onUpdatePlayer);
socket.on("remove player", onRemovePlayer);
socket.on("new projectile", onNewProjectile);


var scene = new THREE.Scene();
var sceneCSS = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
//renderer.setClearColor( 0xffffff, 0);
document.body.appendChild( renderer.domElement );

var rendererCSS = new THREE.CSS3DRenderer();
rendererCSS.setSize(window.innerWidth, window.innerHeight);
rendererCSS.domElement.style.position = 'absolute';
rendererCSS.domElement.style.top = 0;
document.body.appendChild(rendererCSS.domElement);

var light = new THREE.DirectionalLight(0xf6e86d, 1);
light.position.set(0.4, 100, 2);
scene.add(light);

var lightGlobal = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1);
scene.add( lightGlobal );

var geometryBox = new THREE.BoxGeometry( 1, 1, 1);
var materialBox = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );

var geometrySphere = new THREE.SphereGeometry( 0.2, 64, 64 );
var materialSphere = new THREE.MeshBasicMaterial( { color: 0xCC0000 } );

var geoEarth = new THREE.SphereGeometry( 1000, 32, 32 );
var matEarth = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('/img/planet.jpg'),  // specify and load the texture
  });
 
matEarth.depthWrite = false;
matEarth.depthTest = false;
  
var earth = new THREE.Mesh(geoEarth, matEarth);
earth.position.set(160, -20, 60);
earth.rotation.set(5, 2, 5);
scene.add(earth);

function randomNumber(MAX, MIN){
	var number = Math.floor((Math.random() * MAX) + MIN);
	return number;
};


var cube = new Ship( geometryBox, materialBox );
cube.setPlayerID(randomNumber(9999, 1000));
cube.position.set(randomNumber(5, 1), randomNumber(5, 1), randomNumber(5, 1) );
cube.setHealth(100);
cube.firedProjectiles = [];
cube.setSpeed(0.5);
cube.receiveShadow = true;
cube.castShadow = true;
cube.add(camera);
scene.add( cube );
camera.position.y = 1.5;
camera.position.z = 5;

var tempGeo, tempMat;
var rockGeo, rockMat;

var loader = new THREE.JSONLoader(); // init the loader util

loader.load('models/fighter.json', function (geometry) {
  // create a new material
  var material = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('/img/texture.jpg'),  // specify and load the texture
  });
  
  // create a mesh with models geometry and material
  var playerMesh = new THREE.Mesh(
    geometry,
    material
  );
  tempGeo = geometry;
  tempMat = material;
  cube.geometry = geometry;
  cube.material = material;
  cube.scale = 0.2;
});

var urls = [
  'img/box_right1.jpg',
  'img/box_left2.jpg',
  'img/box_top3.jpg',
  'img/box_bottom4.jpg',
  'img/box_front5.jpg',
  'img/box_back6.jpg'
];

var cubemap = THREE.ImageUtils.loadTextureCube(urls); // load textures
cubemap.format = THREE.RGBFormat;

var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib
shader.uniforms['tCube'].value = cubemap; // apply textures to shader

// create shader material
var skyBoxMaterial = new THREE.ShaderMaterial( {
  fragmentShader: shader.fragmentShader,
  vertexShader: shader.vertexShader,
  uniforms: shader.uniforms,
  depthWrite: false,
  side: THREE.BackSide
});

// create skybox mesh
var skybox = new THREE.Mesh(
  new THREE.CubeGeometry(1000, 1000, 1000),
  skyBoxMaterial
);
skybox.renderOrder = -1;
scene.add(skybox);


/* var label = document.createElement( 'p' );
label.className = 'playerTag';
label.textContent = "THREE.JS";
labelObject = new THREE.CSS3DObject( label );
labelObject.scale.set(0.1, 0.1, 0.1)
sceneCSS.add(labelObject);
 */

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
});

document.getElementsByTagName("canvas")[0].addEventListener("click", function() {
	this.requestPointerLock();
}, false);

document.getElementsByTagName("div")[0].addEventListener("click", function() {
	this.requestPointerLock();
}, false);


$( "body" ).mousedown(function() {	
		cube.fireBullet();
});

var render = function () {
	requestAnimationFrame( render );
	positionScene();
	getInput();
	socket.emit("update player", {playerMatrix: cube.matrix});
	moveProjectiles();
	moveRemoteProj();
	checkCollision();
	updateHUD();
	rendererCSS.render(sceneCSS, camera);
	renderer.render(scene, camera);
};

function test(){
	
}

function updateHUD(){
	$("#healthText").text("Health: " + cube.getHealth() + "%");
}

function positionScene(){
	earth.position.x = cube.position.x + 1600;
	earth.position.y = cube.position.y + 10;
	earth.position.z = cube.position.z + 5;
	
	skybox.position.x = cube.position.x;
	skybox.position.y = cube.position.y;
	skybox.position.z = cube.position.z;
}

function checkCollision(){
	var localBox = new THREE.Box3().setFromObject(cube);
	var bulletBox;
	var collision;
	if(remoteProjectiles.length > 0){
		for(var i = 0; i < remoteProjectiles.length; i++){
			bulletBox = new THREE.Box3().setFromObject(remoteProjectiles[i]);
			collision = localBox.isIntersectionBox(bulletBox);
			
				if (collision == true){
					cube.takeDamage(10);
				}
		}
	}
	
	if(cube.getHealth() <= 0){
		cube.respawn();
	}
}

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
		console.log("remote projectiles:" + remoteProjectiles.length);
	}
	if("73" in keysDown){ //I for ID testing
		console.log("local ship ID:" + cube.getPlayerID());
		console.log("remote ship ID:" + remoteShips[0].getPlayerID());
	}
	if("79" in keysDown){ //O
		earth.rotation.x += 0.1;
		console.log("earth rot" + earth.rotation.x + " " + earth.rotation.y + " " + earth.rotation.z);
	}
	if("80" in keysDown){ //P
		earth.rotation.y += 0.1;
		console.log("earth rot" + earth.rotation.x + " " + earth.rotation.y + " " + earth.rotation.z);
	}
}

function onSocketConnected() {
	console.log("scoket connected (client)");
	console.log("cube get id: " + cube.getPlayerID());
	socket.emit("new player", {id: cube.id, playerMatrix: cube.matrix});
}
function onSocketDisconnect(data) {
    console.log("Disconnected from socket server: " + data.id);
};

function onNewPlayer(data) {
    console.log("New player connected: "+data.id);
	var newShip = new Ship(tempGeo, tempMat);
	newShip.id = data.id;
	newShip.matrixAutoUpdate = false;
	newShip.matrix = data.playerMatrix;
	scene.add(newShip);

	remoteShips.push(newShip);
};

function onUpdatePlayer(data) {	
	var moveShip = shipById(data.id);
	moveShip.matrix = data.playerMatrix;
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

function onNewProjectile(data) {
	var newProjectile = new Projectile(geometrySphere, materialSphere);
	
	newProjectile.id = data.idBul;
	newProjectile.matrixAutoUpdate = false;
	newProjectile.applyMatrix(data.projectileMatrix);
	scene.add(newProjectile);
	
	remoteProjectiles.push(newProjectile);
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
		
		remoteProjectiles[i].translateZ(-4);
		remoteProjectiles[i].updateMatrix();
	}
}


function moveProjectiles(){
	for(var i = 0; i < cube.firedProjectiles.length; i++){
		cube.firedProjectiles[i].translateZ(-4);
	}
}

function generateDebris(){
	var loader2 = new THREE.JSONLoader(); // init the loader util
	loader2.load('models/rock.json', function (geometry) {
  // create a new material
	var material = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture('/img/rock.jpg'),  // specify and load the texture
	});
	
	for(i = 0; i < 100; i++){
		//var debrisGeometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
		//var debrisMaterial = new THREE.MeshLambertMaterial( { color: 0x0000CC } );
		
		var randomX = randomNumber(1000, -300);
		var randomY = randomNumber(1000, -300);
		var randomZ = randomNumber(1000, -300);
		
		var debris = new THREE.Mesh( geometry, material );
		debris.position.x = randomX;
		debris.position.y = randomY;
		debris.position.z = randomZ;
		debris.rotation.x += randomX;
		debris.rotation.y += randomY;
		debris.scale.set(randomNumber(10, 4), randomNumber(10, 4), randomNumber(10, 4));
		debris.receiveShadow = true;
		debris.castShadow = true;
		scene.add( debris );
	};
  

	});
	
}
generateDebris();
render();