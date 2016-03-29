function Player(){ 
		var username;
		var id;
		var score;
		var place;

	var setUsername = function(newUsername){
		this.username = newUsername;
	}
	var getUsername = function(){
		return this.username;
	}
	var setScore = function(newScore){
		this.score = newScore;
	}
	var getScore = function(){
		return this.score;
	}
	var getID = function(){
		return this.id;
	}
	var setID = function(newID){
		this.id = newID;
	}
	var getPlace = function(){
		return this.place;
	}
	var setPlace = function(newPlace){
		this.place = newPlace;
	}
	return {
		setID: setID,
		getID: getID,
		setUsername: setUsername,
		getUsername: getUsername,
		setScore: setScore,
		getScore: getScore,
		setPlace: setPlace,
		getPlace: getPlace
    }
};

exports.Player = Player;