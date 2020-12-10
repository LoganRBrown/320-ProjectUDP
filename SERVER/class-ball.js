const NetworkObject = require("./class-networkobject.js").NetworkObject


exports.Ball = class Ball extends NetworkObject{
	constructor(){
		super();
		this.classID = "BALL";
		this.position = {x:0,y:0};
		this.velocity = {x:-1,y:-2};
		this.width = 10;
		this.height = 10;
	}
	update(game){

		this.position.x += this.velocity.x * game.dt;

	}
	serialize(){
		const p = super.serialize();
		//add to packet...
		return p;
	}
}