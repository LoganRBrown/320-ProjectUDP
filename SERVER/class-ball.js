const NetworkObject = require("./class-networkobject.js").NetworkObject


exports.Ball = class Ball extends NetworkObject{
	constructor(){
		super();
		this.classID = "BALL";
		this.position = {x:0,y:0};
		this.velocity = {x:0,y:0};
		this.width = 10;
		this.height = 10;
	}
	update(game){



	}
	serialize(){
		const p = super.serialize();
		//add to packet...
		return p;
	}
}