const NetworkObject = require("./class-networkobject.js").NetworkObject


exports.Ball = class Ball extends NetworkObject{
	constructor(){
		super();
		this.classID = "BLLT";
	}
	update(){

	}
	serialize(){
		const p = super.serialize();
		//add to packet...
		return p;
	}
}