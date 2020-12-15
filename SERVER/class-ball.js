const NetworkObject = require("./class-networkobject.js").NetworkObject


exports.Ball = class Ball extends NetworkObject{
	constructor(){
		super();
		this.classID = "BALL";
		this.belongsToPlayer = 0;
		this.position = {x:0,y:0};
		this.velocity = {x:-1,y:-2};
		this.width = 10;
		this.height = 10;
	}
	update(game){

		//this.position.x += this.velocity.x * game.dt;
		this.position.y += this.velocity.y * game.dt;
		this.position.x += this.velocity.x * game.dt;

		ballPacket(game.server);

	}
	ballPacket(server){
		const packet = Buffer.alloc(6);

		packet.write("BALL", 0);
		packet.writeUInt8(this.position.x, 4);
		packet.writeUInt8(this.position.y, 5);

		server.SendPacketToAll(packet);
	}
	serialize(){
		const p = super.serialize();
		//add to packet...
		return p;
	}
}