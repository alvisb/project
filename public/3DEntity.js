function Entity3D(){ 
    THREE.Mesh.apply(this,Array.prototype.slice.call(arguments));

	Entity3D.prototype.describe = function(){
		THREE.Mesh.prototype.describe.call(this);
		var id;
		var rotationalMatrix =  new THREE.Matrix4();
		var speed = 0.5;
		var damage = 0;
		var boundingBox;
		var position = new THREE.Vector3();
		
	}

}

Entity3D.prototype = new THREE.Mesh();
Entity3D.prototype.constructor = THREE.Entity3D;

Entity3D.prototype.setID = function(newID){
	this.id = newID;
}
Entity3D.prototype.getID = function(){
	return this.id;
}

Entity3D.prototype.setPosition = function(newMatrix){
	this.position.set(0, 0, 0);
}

Entity3D.prototype.setMatrix = function(newMatrix){
	this.setRotationFromMatrix(newMatrix);
}
Entity3D.prototype.getMatrix = function(){
	return this.rotationalMatrix;
}

Entity3D.prototype.move = function(x, y, z){
	this.translateX(x * this.speed);
	this.translateY(y * this.speed);
	this.translateZ(z * this.speed);
}

Entity3D.prototype.setSpeed = function(newSpeed){
	this.speed = newSpeed;
}
Entity3D.prototype.getSpeed = function(){
	return this.speed;
}

Entity3D.prototype.setDamage = function(newDamage){
	this.damage = newDamage;
}
Entity3D.prototype.getDamage = function(){
	return this.damage;
}

Entity3D.prototype.setBoundingBox = function(){
	this.boundingBox = new THREE.Box3().setFromObject(this);
}
Entity3D.prototype.getBoundingBox = function(){
	return this.boundingBox;
}