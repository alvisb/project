var socket = io();
socket.on("join room", onJoinRoom);
socket.on("add room", onAddRoom);

/* function switchFrame(button_name){
	var $iframe = $('#' + "frame");
	var button = button_name;
    if ( $iframe.length ) {
        $iframe.attr('src', button + ".html");   
        return false;
    }
    return true;
} */

var existingRooms = [];
existingRooms.push("default");

function init(){
	$("#mainDiv").children().hide();
	$(".joinRoom").show();
}

function switchFrame(button_name){
	$("#mainDiv").children().hide();
	var selectedDiv = $('.' + button_name);
	selectedDiv.show();
 
}

function register(){
	alert("Sorry, that username is already taken!");
}

function createRoom(){
	var name = $("[name='roomName']").val();

	if($.inArray( name, existingRooms )>=0){
		alert("Sorry, a room with that name already exists!");
	}else{
		if(name.length > 30){
			alert("The room name is too long! Please enter a name that's 30 characters or less");
		}
		else{
			socket.emit("create room", {roomName: name});
			console.log("room created!" + name);
			existingRooms.push(name);
		}
	}
}


function onJoinRoom(room_name){
	socket.join(room_name);
}

function onAddRoom(data){
	if($.inArray( data.roomName, existingRooms )>=0){//for existing rooms
		//don't need to do anything
	}else{
		var roomContainer = document.createElement("DIV");  
		roomContainer.className = "room-container";
		
		var roomPara = document.createElement("P");          
		roomPara.className = "roomPara";// Create a <p> element
		
		var roomText = document.createTextNode(data.roomName);      // Create a text node
		roomPara.appendChild(roomText);    
		
		var joinButton = document.createElement("BUTTON");   
		joinButton.className = "buttonJoin";
		joinButton.name = data.roomName;
		
		var btnText = document.createTextNode("Join");
		joinButton.appendChild(btnText);
		
		roomContainer.appendChild(roomPara);
		roomContainer.appendChild(joinButton);
		
		$(".joinRoom").append(roomContainer);
	}
}

function updateRooms(){
	
}

$(document).ready(function(){
    init();
});