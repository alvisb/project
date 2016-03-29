function Entity3D(){ 
    THREE.Mesh.apply(this,arguments);
	this.id = "1234";
	this.speed = 1;
	this.damage = 0;
	this.position = new THREE.Vector3();
	this.velocity = new THREE.Vector3(0, 0, 0);
	this.acceleration = new THREE.Vector3(0, 0, 0);
	this.velVector = new THREE.Vector3(0, 0, 0);
	this.moving = false;
	this.moveDirection = {
		 FORWARD: false,
		 BACKWARD: false,
		 LEFT: false,
		 RIGHT: false
	}
	
	this.setID = function(newID){
		this.id = newID;
	}
	this.getID = function(){
		return this.id;
	}

	this.setPosition = function(newMatrix){
		this.position.set(0, 0, 0);
	}
	this.getPosition = function(newMatrix){
		return this.position;
	}

	this.setMatrix = function(newMatrix){
		this.setRotationFromMatrix(newMatrix);
	}
	this.getMatrix = function(){
		return this.rotationalMatrix;
	}

	this.move = function(x, y, z){
		this.translateX(x * this.speed);
		this.translateY(y * this.speed);
		this.translateZ(z * this.speed);
	}

	this.setSpeed = function(newSpeed){
		this.speed = newSpeed;
	}
	this.getSpeed = function(){
		return this.speed;
	}

	this.setDamage = function(newDamage){
		this.damage = newDamage;
	}
	this.getDamage = function(){
		return this.damage;
	}

}

Entity3D.prototype = Object.create(THREE.Mesh.prototype);
Entity3D.prototype.constructor = Entity3D;
