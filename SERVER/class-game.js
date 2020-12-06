
const Pawn = require("./class-pawn.js").Pawn;

exports.Game = class Game {
	constructor(server){

		this.time = 0;
		this.frame = 0;
		this.dt = 16/1000;
		this.timeUntilNextStatePacket = 0;

		this.objs = []; // store NetworkObjects in here

		this.ballPos = {
			x: 0,
			y: 0,
			z: 0
		};

		this.server = server;
		this.update();

	}
	update(){

		this.time += this.dt;
		this.frame++;

		this.server.update(this); // check clients for disconnects, etc.

		const player = this.server.getPlayer(0);

		for(var i in this.objs){
			this.objs[i].update(this);
		}

		if(player){

		}
		
		if(this.timeUntilNextStatePacket > 0){
			// count down
			this.timeUntilNextStatePacket -= this.dt;
		}
		else{
			this.timeUntilNextStatePacket = .1; // send 10% packets (~1/6 frames)
			this.sendBallPos();
		}

		setTimeout(()=>this.update(), 16);
	}
	sendWorldState(){
		const packet = makeREPL(true);
		this.server.SendPacketToAll(packet);
	}
	makeREPL(isUpdate){

		isUpdate = !!isUpdate;

		let packet = Buffer.alloc(20);
		packet.write("REPL", 0);
		packet.writeUint8( isUpdate ? 2 : 1, 4);

		const packedObjs = [];
		
		this.objs.forEach(o=>{

			const classID = Buffer.from(o.classID);
			const data = o.serialize();

			packet = Buffer.concat([packet, classID, data]);

		});

		return packet;

		//this.server.SendPacketToAll(packet);
	}
	spawnObject(obj){
		this.objs.push(obj);

		let packet = Buffer.alloc(5);
		packet.write("REPL", 0);
		packet.writeUint8(1, 4);
		

		const classID = Buffer.from(obj.classID);
		const data = obj.serialize();

		packet = Buffer.concat([packet, classID, data]);

		this.server.SendPacketToAll(packet);
	}
	removeObject(obj){
		const index = this.objs.indexOf(obj);

		if(index < 0) return; // object doesn't exist...

		const netID = this.objs[index].networkID; // get Id of object

		this.objs.splice(index, 1); // remove object from array

		const packet = Buffer.alloc(6);
		packet.write("REPL", 0);
		packet.writeUInt8(3, 4); // 3 = DELETE
		packet.writeUInt8(netID, 5);

		this.server.SendPacketToAll(packet);
	}
}