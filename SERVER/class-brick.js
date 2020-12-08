const NetworkObject = require("./class-networkobject.js").NetworkObject


exports.Brick = class Brick extends NetworkObject{
	constructor(){
		super();
		this.classID = "BRCK";
		this.position = {x:0,y:0};
		this.width = 10;
		this.height = 10;
	}
	update(){

	}
	serialize(){
		const p = super.serialize();
		//add to packet...
		return p;
	}
}