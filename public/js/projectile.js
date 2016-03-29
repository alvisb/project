function Projectile(){ 
    Entity3D.apply(this, arguments);
	var playerID;
	var shipDmg;
	var dmgMultiplier;

	this.setPlayerID = function(newPlayerID){
		this.playerID = newPlayerID;
	}
	this.getPlayerID = function(){
		return this.playerID;
	}

	this.setShipDmg = function(newShipDmg){
		this.shipDmg = shipDmg;
	}
	this.getShipDmg = function(){
		return this.shipDmg;
	}

	this.setShipDmg = function(newShipDmg){
		this.shipDmg = shipDmg;
	}
	this.getShipDmg = function(){
		return this.shipDmg;
	}

	this.setDmgMultipllier = function(newDmgMultiplier){
		this.dmgMultiplier = newDmgMultiplier;
	}
	this.getDmgMultipllier = function(){
		return this.dmgMultiplier;
	}

	this.applyDmgMultiplier = function(){
		this.damage = shipDmg * dmgMultiplier;
	}

}

Projectile.prototype = Object.create(Entity3D.prototype);
Projectile.prototype.constructor = Projectile;

