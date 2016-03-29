function Explosion(){ 
    Entity3D.apply(this, arguments);

	this.duration = new THREE.Clock();
	this.duration.start();
	
	this.explode = function(){
		this.scale.x = this.duration.getElapsedTime() * 2000;
		this.scale.y = this.duration.getElapsedTime() * 2000;
		this.scale.z = this.duration.getElapsedTime() * 2000;
	}
}

Explosion.prototype = Object.create(Entity3D.prototype);
Explosion.prototype.constructor = Explosion;

