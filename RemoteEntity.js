function RemoteEntity(){ 

		var position;
		var matrix;
		var id;

	var setPosition = function(newPosition){
		this.position = newPosition;
	}
	var getPosition = function(){
		return this.position;
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
        id: id
    }
};

exports.RemoteEntity = RemoteEntity;