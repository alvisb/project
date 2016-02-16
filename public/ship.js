function Ship(){ 
    Entity3D.apply(this,Array.prototype.slice.call(arguments));

	Ship.prototype.describe = function(){
		Entity3D.prototype.describe.call(this);
		var playerID;
		var health = 0;
		var firedProjectiles;
		var input = 2;
	}

}

Ship.prototype = new Entity3D();
Ship.prototype.constructor = THREE.Ship;

Ship.prototype.setPlayerID = function(newPlayerID){
	this.playerID = newPlayerID;
}
Ship.prototype.getPlayerID = function(){
	return this.playerID;
}

Ship.prototype.takeDamage = function(damage){
	
}

Ship.prototype.setHealth = function(newHealth){
	this.health = newHealth;
}
Ship.prototype.getHealth = function(){
	return this.health;
}

Ship.prototype.recieveInput = function(newInput){
	input = newInput;
}

Ship.prototype.getProjectiles = function(){
	return this.firedProjectiles;
}

Ship.prototype.fireBullet = function(){
	var geometry = new THREE.SphereGeometry( 0.5, 32, 32 );
		var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
		var localBullet = new Projectile(geometry, material);
			//localBullet.setRotationFromMatrix(this.rotationalMatrix);
			localBullet.position.x = this.position.x;
			localBullet.position.y = this.position.y;
			localBullet.position.z = this.position.z;
			localBullet.setSpeed(3);
			localBullet.setMatrix(this.matrix);
			scene.add(localBullet);
			this.firedProjectiles.push(localBullet);
}

Ship.prototype.shoot = function(){
	var fireBullet = this.fireBullet();
	
}



Ship.prototype.respawn = function(){
	this.position.set(5, 5, 2);
}