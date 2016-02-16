function Projectile(){ 
    Entity3D.apply(this,Array.prototype.slice.call(arguments));

	Projectile.prototype.describe = function(){
		Entity3D.prototype.describe.call(this);
		var playerID;
		var shipDmg;
		var dmgMultiplier;
	}

}

Projectile.prototype = new Entity3D();
Projectile.prototype.constructor = THREE.Projectile;

Projectile.prototype.setPlayerID = function(newPlayerID){
	this.playerID = newPlayerID;
}
Projectile.prototype.getPlayerID = function(){
	return this.playerID;
}

Projectile.prototype.setShipDmg = function(newShipDmg){
	this.shipDmg = shipDmg;
}
Projectile.prototype.getShipDmg = function(){
	return this.shipDmg;
}

Projectile.prototype.setShipDmg = function(newShipDmg){
	this.shipDmg = shipDmg;
}
Projectile.prototype.getShipDmg = function(){
	return this.shipDmg;
}

Projectile.prototype.setDmgMultipllier = function(newDmgMultiplier){
	this.dmgMultiplier = newDmgMultiplier;
}
Projectile.prototype.getDmgMultipllier = function(){
	return this.dmgMultiplier;
}

Projectile.prototype.applyDmgMultiplier = function(){
	this.damage = shipDmg * dmgMultiplier;
}