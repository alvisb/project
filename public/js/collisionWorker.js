onmessage = function(e) {
	for(var i = 0; i < e.asteroids.length; i++){
			var oldVector = e.asteroids[i].getLinearVelocity(); // Vector of velocity the asteroid already has
			var asteroidVec3 = new THREE.Vector3(oldVector.x + 2, oldVector.y, oldVector.z);
		
			e.asteroids[i].setLinearVelocity(asteroidVec3);
	}
}