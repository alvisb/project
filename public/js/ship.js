function Ship(){ 
    Entity3D.apply(this, arguments);
	
	this.playerID = "2";
	this.health = 0;
	this.firedProjectiles = [];

	this.setPlayerID = function(newPlayerID){
		this.playerID = newPlayerID;
	}
	this.getPlayerID = function(){
		return this.playerID;
	}

	this.takeDamage = function(damage){
		this.health -= damage;
	}

	this.setHealth = function(newHealth){
		this.health = newHealth;
	}
	this.getHealth = function(){
		return this.health;
	}

	this.recieveInput = function(newInput){
		input = newInput;
	}

	this.getProjectiles = function(){
		return this.firedProjectiles;
	}

	this.fireBullet = function(){
		if(this.firedProjectiles.length > 20){
				scene.remove(this.firedProjectiles[0]); // stop rendering bullet
				this.firedProjectiles.shift(); //remove bullet from the array
			}
		var geometry = new THREE.SphereGeometry( 0.2, 8, 8 );
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


	this.respawn = function(){
		this.position.set(randomNumber(5, 1), randomNumber(5, 1), randomNumber(5, 1) );
		this.health = 100;
	}
	
	this.update = function(delta) {
		this.translateX(this.velocity.x);
		this.translateY(this.velocity.y);
		this.translateZ(this.velocity.z);
		this.velocity.x /=1.1;
		this.velocity.y /=1.1;
		this.velocity.z /=1.1;
	};

}

Ship.prototype = Object.create(Entity3D.prototype);
Ship.prototype.constructor = Ship;