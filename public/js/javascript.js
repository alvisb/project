var socket = io();
var remoteShips = [];
var remoteProjectiles = [];

var collisionWorker = new Worker("worker.js");

Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

socket.on("connect", onSocketConnected);
socket.on("disconnect", onSocketDisconnect);
socket.on("new player", onNewPlayer);
socket.on("update player", onUpdatePlayer);
socket.on("remove player", onRemovePlayer);
socket.on("new projectile", onNewProjectile);
socket.on("generate asteroids", onGenerateAsteroids);
//socket.on("update asteroids", onUpdateAsteroids);

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};


var scene = new THREE.Scene();
var sceneCSS = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 55, window.innerWidth/window.innerHeight, 0.1, 30000 );

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

var asteroids = [];
var explosions = [];

function randomNumber(MAX, MIN){
	var number = Math.floor((Math.random() * MAX) + MIN);
	return number;
};

var particleSystem;

var clock = new THREE.Clock();
var player = new Ship( geometryBox, materialBox );
player.setPlayerID(randomNumber(9999, 1000));
player.position.set(randomNumber(5, 1), randomNumber(5, 1), randomNumber(5, 1) );
player.setHealth(100);
player.firedProjectiles = [];
player.setSpeed(0.5);
player.receiveShadow = true;
player.castShadow = true;
player.add(camera);
scene.add( player );
camera.position.y = 4.5;
camera.position.z = 15;

/* var box = new Physijs.BoxMesh(
            new THREE.CubeGeometry( 5, 5, 5 ),
            new THREE.MeshBasicMaterial({ color: 0x888888 }),
			8
        );
        scene.add( box );
		box.add(camera);
		
		
var plane = new Physijs.BoxMesh(
      new THREE.CubeGeometry(100, 100, 2, 10, 10),
      Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
          color: 0xeeeeee
        }),
        .4,
        .8
      ),
      0
    );

    plane.rotation.x = -Math.PI / 2;
    plane.rotation.y = Math.PI / 24;
	plane.position.y = -5;
    plane.receiveShadow = true;

    scene.add(plane);
 */
var stationMesh = new THREE.Mesh(
    geometryBox,
    materialBox
  );
stationMesh.receiveShadow = true;
stationMesh.castShadow = true;
stationMesh.position.x = 200;
scene.add(stationMesh);
  

var tempGeo, tempMat;

var orbit = new THREE.Object3D();
orbit.position.x = 200;
scene.add( orbit );

var loader = new THREE.JSONLoader(); // init the loader util

loader.load('models/fighter.json', function (geometry) {
  // create a new material
  var material = new THREE.MeshLambertMaterial( { color: 0xCCCCCC } );
  
  tempGeo = geometry;
  tempMat = material;
  player.geometry = geometry;
  player.material = material;
  //box.geometry = geometry;
  
});

loader.load('models/station.json', function (geometry) {
  // create a new material
  var material = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('/img/stationTexture.jpg'),  // specify and load the texture
  });
  
  // create a mesh with models geometry and material
  

  stationMesh.geometry = geometry;
  stationMesh.material = material;
});

var skybox;

function loadSkybox(){
	var urls = [
	  'img/box_right1.jpg',
	  'img/box_left2.jpg',
	  'img/box_top3.jpg',
	  'img/box_bottom4.jpg',
	  'img/box_front5.jpg',
	  'img/box_back6.jpg'
	];

	var playermap = THREE.ImageUtils.loadTextureCube(urls); // load textures
	playermap.format = THREE.RGBFormat;

	var shader = THREE.ShaderLib['cube']; // init player shader from built-in lib
	shader.uniforms['tCube'].value = playermap; // apply textures to shader

	// create shader material
	var skyBoxMaterial = new THREE.ShaderMaterial( {
	  fragmentShader: shader.fragmentShader,
	  vertexShader: shader.vertexShader,
	  uniforms: shader.uniforms,
	  depthWrite: false,
	  side: THREE.BackSide
	});

	// create skybox mesh
	skybox = new THREE.Mesh(
	  new THREE.CubeGeometry(1000, 1000, 1000),
	  skyBoxMaterial
	);
	skybox.renderOrder = -1;
	scene.add(skybox);

}

if(!isMobile.any()){
	loadSkybox();
}

/* var label = document.createElement( 'p' );
label.className = 'playerTag';
label.textContent = "THREE.JS";
labelObject = new THREE.CSS3DObject( label );
labelObject.scale.set(0.1, 0.1, 0.1)
sceneCSS.add(labelObject);
 */

var inputObj = new InputController();
		
document.addEventListener("mousemove", function(e) {
		player.rotateY (e.movementX * 0.01 *(-1));
		player.rotateX (e.movementY * 0.01 *(-1));
		
		/* var oldVector = box.getAngularVelocity(); // Vector of velocity the player already has
		var playerVec3 = new THREE.Vector3(oldVector.x + e.movementY * -0.01, oldVector.y + e.movementX * -0.01, oldVector.z);
	
		box.setAngularVelocity(playerVec3); */
		
		/* if(e.movementY > 0.5 && camera.position.y < 2){
			camera.position.y += 0.01;
		}
		if(e.movementY < -0.5 && camera.position.y > -1){
			camera.position.y -= 0.01;
		}
		if(e.movementX > 0.5 && camera.position.x < 2){
			camera.position.x += 0.01;
		}
		if(e.movementX < -0.5 && camera.position.x > -2){
			camera.position.x -= 0.01;
		}
		 */
		/* if(e.movementX > 0.5){
			//player.rotateY(-0.005);
			player.rotateZ(-0.005);
		}
		if(e.movementX < -0.5){
			//player.rotateY(0.005);
			player.rotateZ(0.005);
		}
		if(e.movementY > 0.5){
			player.rotateX(0.005);
		}
		if(e.movementY < -0.5){
			player.rotateX(-0.005);
		} */
		
});

document.getElementsByTagName("canvas")[0].addEventListener("click", function() {
	this.requestPointerLock();
}, false);

document.getElementsByTagName("div")[0].addEventListener("click", function() {
	this.requestPointerLock();
}, false);

document.addEventListener("click", function(){
	player.fireBullet();
});

var render = function () {
	requestAnimationFrame( render );
	//scene.simulate(); // run physics
	test();
	positionScene();
	getInput();
	socket.emit("update player", {playerMatrix: player.matrix});
	player.update(clock.getDelta() * 5);
	moveProjectiles();
	moveRemoteProj();
	checkCollision();
	updateHUD();
	rendererCSS.render(sceneCSS, camera);
	renderer.render(scene, camera);
};

var G = 6; // m3 kg-1 s-2


function test(){
	//moveParticles();
	//orbit.rotation.z += 0.0001;
	moveAsteroids();
	handleExplosions();
}
/* update asteroids
function onUpdateAsteroids(){
	for(var i = 0; i < data.asteroidArray.length; i++){

		asteroids[i].position.x = data.asteroidArray[i].position.x;
		asteroids[i].rotation.y = data.asteroidArray[i].position.y;
		asteroids[i].rotation.z = data.asteroidArray[i].position.z;
} */

function moveAsteroids(){
	
	for(var i = 0; i < asteroids.length; i++){
		var distance = asteroids[i].position.distanceTo(orbit.position);
		asteroids[i].position.x += asteroids[i].speed + 5;
		asteroids[i].rotation.y += asteroids[i].rotAmount * 0.001;
		
		if(asteroids[i].position.x > 30000){
			asteroids[i].position.x = - 30000;
		}
	}

}

function updateHUD(){
	$("#healthText").text("Health: " + player.getHealth() + "%");
	$("#infoText").text("X: " + Math.floor(player.position.x));
	$("#infoText2").text("Y: " + Math.floor(player.position.y));
	$("#infoText3").text("Z: " + Math.floor(player.position.z));
}

function positionScene(){
	earth.position.x = player.position.x + 1800;
	earth.position.y = player.position.y + 10;
	earth.position.z = player.position.z + 5;
	
	if(!isMobile.any()){
		skybox.position.x = player.position.x;
		skybox.position.y = player.position.y;
		skybox.position.z = player.position.z;
	}

	stationMesh.rotation.z += 0.001;
}

function checkCollision(){
	collisionPlayer();
}

function collisionPlayer(){
	var localBox = new THREE.Box3().setFromObject(player);
	var bulletBox;
	var collision;
	if(remoteProjectiles.length > 0){
		for(var i = 0; i < remoteProjectiles.length; i++){
			bulletBox = new THREE.Box3().setFromObject(remoteProjectiles[i]);
			collision = localBox.isIntersectionBox(bulletBox);
			
				if (collision == true){
					player.takeDamage(10);
				}
		}
	}
	if(player.getHealth() <= 0){
		player.respawn();
	}
}

function collisionAsteroid(){
	var localBox = new THREE.Box3().setFromObject(player);
	var asteroidBox;
	var collision;
	if(asteroids.length > 0){
		for(var i = 0; i < asteroids.length; i++){
			asteroidBox = new THREE.Box3().setFromObject(asteroids[i]);
			collision = localBox.isIntersectionBox(asteroidBox);
			
				if (collision == true){
					player.takeDamage(10);
				}
		}
	}
}

/* Physijs.BoxMesh.prototype.move = function(x ,y ,z){
	var oldVector = this.getLinearVelocity(); // Vector of velocity the player already has
    var playerVec3 = new THREE.Vector3(oldVector.x + x, oldVector.y + y, oldVector.z + z);
	
	this.setLinearVelocity(playerVec3);
} */
var keysDown = [];

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
});

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
});

function getInput(){
	if ("87" in keysDown && player.velocity.z > -10){// W
		player.velocity.z -= player.speed;
	}
	if ("65" in keysDown && player.velocity.x > -6){// A
		player.velocity.x -= player.speed;
	}
	if ("83" in keysDown && player.velocity.z < 10){// S
		player.velocity.z += player.speed;
	}
	if ("68" in keysDown && player.velocity.x < 6){// D
		player.velocity.x += player.speed;
	}
	if ("32" in keysDown && player.velocity.z < 6){// SPACEBAR
		var sphereGeo = new THREE.SphereGeometry( 0.2, 64, 64 );
		var sphereMat = new THREE.MeshBasicMaterial( { color: 0xFFFF00 } );
		var explosion = new Explosion(sphereGeo, sphereMat);
		explosion.setPosition(player.position.x, player.position.y, player.position.z);
		scene.add(explosion);
		explosions.push(explosion);
	}
}

function handleExplosions(){
	for(var i = 0; i < explosions.length; i++){
		if(explosions[i].duration.getElapsedTime() > 1){
			scene.remove(explosions[i]);
			explosions.splice(explosions[i], 1);
		}
		if(explosions.length >= 1){
			explosions[i].explode();
		}
	}
}

function onSocketConnected() {
	console.log("scoket connected (client)");
	console.log("player get id: " + player.getPlayerID());
	socket.emit("new player", {id: player.id, playerMatrix: player.matrix});
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
	if(remoteProjectiles.length > 20){
			scene.remove(remoteProjectiles[0]); // stop rendering bullet
			remoteProjectiles.shift(); //remove bullet from the array
		}
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
		
		remoteProjectiles[i].translateZ(-1);
		remoteProjectiles[i].updateMatrix();
	}
}


function moveProjectiles(){
	for(var i = 0; i < player.firedProjectiles.length; i++){
		player.firedProjectiles[i].translateZ(-1);
	}
}

function onGenerateAsteroids(data){
	var loader2 = new THREE.JSONLoader(); // init the loader util
	loader2.load('models/rock.json', function (geometry) {
  // create a new material
		var material = new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture('/img/meteor.jpg'),  // specify and load the texture
		});
		
		for(i = 0; i < data.asteroidArray.length; i++){
			var pivot = new THREE.Object3D();
			pivot.rotation.z = 4 * Math.PI / 3;
			orbit.add(pivot);
			var newAsteroid =  new Physijs.BoxMesh( geometry, material );

			if(data.asteroidArray[i].explosive == 11){
				newAsteroid.material = new THREE.MeshLambertMaterial( { color: 0xCC0000 } );
			}
			newAsteroid.position.x = data.asteroidArray[i].posX;
			newAsteroid.position.y = data.asteroidArray[i].posY;
			newAsteroid.position.z = data.asteroidArray[i].posZ;

			newAsteroid.rotation.x = data.asteroidArray[i].rotX;
			newAsteroid.rotation.y = data.asteroidArray[i].rotY;
			newAsteroid.rotation.z = data.asteroidArray[i].rotZ;
			
			newAsteroid.scale.x = data.asteroidArray[i].scaleX;
			newAsteroid.scale.y = data.asteroidArray[i].scaleY;
			newAsteroid.scale.z = data.asteroidArray[i].scaleZ;
			
			newAsteroid.rotAmount = data.asteroidArray[i].rotAmount;
			newAsteroid.speed = data.asteroidArray[i].speed;
			
			newAsteroid.bbox = new THREE.Box3().setFromObject(newAsteroid);
			//newAsteroid.receiveShadow = true;
			//newAsteroid.castShadow = true;
			//pivot.add(asteroid);
			scene.add( newAsteroid );
			asteroids.push(newAsteroid);
		};
	});
	
}

function particleTest(){
	var particleCount = 50000;
	var particleGeo = new THREE.Geometry();
	var particleMat = new THREE.PointsMaterial( {color: 0xCC0000, size: 5, opacity: 0.5, sizeAttenuation: false, transorbit: true } );

	for (var p = 0; p < particleCount; p++) {

		  // create a particle with random
		  // position values, -250 -> 250
		  var pX = Math.random() * 50 - 25,
				  pY = Math.random() * 50 - 25,
				  pZ = Math.random() * 50 - 25,
				  particle = new THREE.Vector3(pX, pY, pZ);

		  // add it to the geometry
		  particleGeo.vertices.push(particle);
	}

// create the particle system
	particleSystem = new THREE.Points( particleGeo, particleMat );

	// add it to the scene
	scene.add(particleSystem);
}

function moveParticles(){
	//particleSystem.rotation.y += 0.001;
}

//particleTest();
socket.emit("generate asteroids");
render();