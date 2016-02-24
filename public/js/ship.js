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
	this.health -= damage;
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
	var geometry = new THREE.SphereGeometry( 0.2, 32, 32 );
		var material = new THREE.MeshBasicMaterial( { color: 0xCC0000 } );
		var localProjectile = new Projectile(geometry, material);
			//localProjectile.setRotationFromMatrix(this.rotationalMatrix);
			localProjectile.position.x = this.position.x;
			localProjectile.position.y = this.position.y;
			localProjectile.position.z = this.position.z;
			localProjectile.setSpeed(3);
			localProjectile.setMatrix(this.matrix);
			scene.add(localProjectile);
			this.firedProjectiles.push(localProjectile);
			socket.emit("new projectile", {id: localProjectile.id, projectileMatrix: this.matrix});
}


Ship.prototype.respawn = function(){
	this.position.set(randomNumber(5, 1), randomNumber(5, 1), randomNumber(5, 1) );
	this.health = 100;
}