function RemoteEntity(startX, startY, startZ){ 
		var x = startX;
		var z = startZ;
		var y = startY;
		var position;
		var matrix;
		var id;

	var setPosition = function(newPosition){
		this.position = newPosition;
	}
	var getPosition = function(){
		return this.position;
	}
	var getX = function(){
		return this.x;
	}
	var getY = function(){
		return this.y;
	}
	var getZ = function(){
		return this.z;
	}
	
	var setX = function(newX){
		this.x = newX;
	}
	var setY = function(newY){
		this.y = newY;
	}
	var setZ = function(newZ){
		this.z = newZ;
	}

	var getMatrix = function(){
		return this.matrix;
	}
	var setMatrix = function(newMatrix){
		this.matrix = newMatrix;
	}
	
	return {
		setPosition: setPosition,
		getPosition: getPosition,
		getMatrix: getMatrix,
		setMatrix: setMatrix,
		getX: getX,
		getY: getY,
		getZ: getZ,
		setX: setX,
		setY: setY,
		setZ: setZ,
        id: id
    }
};

exports.RemoteEntity = RemoteEntity;