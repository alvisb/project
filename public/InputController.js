function InputController(){ 
	var keysDown = ["2"];
	

		
	
	var setKeysDown = function(event){
		
	}
	var getKeysDown = function(){
		return this.keysDown;
	}

	return {
        setKeysDown: setKeysDown,
		getKeysDown: getKeysDown

    }
};

//exports.InputController = InputController;