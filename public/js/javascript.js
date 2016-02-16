var socket = io();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

var cube = new Ship( geometry, material );
cube.setPosition();
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

}

function moveProjectiles(){
	for(var i = 0; i < cube.firedProjectiles.length; i++){
		cube.firedProjectiles[i].move(0, 0, -1);
	}
}

function generateDebris(){
	for(i = 0; i < 1000; i++){
		var debrisGeometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
		var debrisMaterial = new THREE.MeshBasicMaterial( { color: 0xCCCC00 } );
		
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