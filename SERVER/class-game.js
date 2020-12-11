
const Pawn = require("./class-pawn.js").Pawn;
const Brick = require("./class-brick.js").Brick;
const Ball = require("./class-ball.js").Ball;

exports.Game = class Game {

	static Singleton;

	constructor(server){

		Game.Singleton = this;

		this.time = 0;
		this.frame = 0;
		this.dt = 16/1000;
		this.timeUntilNextStatePacket = 0;

		this.objs = []; // store NetworkObjects in here

		this.bricks = [];

		this.server = server;
		this.update();
		//this.populateGame();

	}
	update(){

		this.time += this.dt;
		this.frame++;

		this.server.update(this); // check clients for disconnects, etc.

		const player = this.server.getPlayer(0);

		const ball = this.objs.find(obj => { return obj.classID === "BALL" });
		const pawn = this.objs.find(obj => { return obj.classID === "PAWN" });

		for(var i in this.objs){
			this.objs[i].update(this);
			this.objectCollision(ball, this.objs[i]);
			this.objectCollision(pawn, this.objs[i]);
		}


		if(player){

		}
		
		if(this.timeUntilNextStatePacket > 0){
			// count down
			this.timeUntilNextStatePacket -= this.dt;
		}
		else{
			this.timeUntilNextStatePacket = .1; // send 10% packets (~1/6 frames)
			this.sendWorldState();
		}

		setTimeout(()=>this.update(), 16);
	}
	sendWorldState(){
		const packet = this.makeREPL(true);
		this.server.SendPacketToAll(packet);
	}
	spawnBricks(){

		if(this.bricks.length >= 29) return;

		let brickClone = new Brick();
		for (var i = 0; i <= 28; i++) {
			this.spawnObject( this.brickClone );
			this.bricks.push(brickClone);
		}
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
	objectCollision(obj1, obj2){

		let collisionHasHappened = false;

		if(obj1 != undefined && obj2 != undefined){

		if(obj1.position.x < obj2.position.x + obj2.width && obj1.position.x + obj1.width > obj2.position.x && obj1.position.y < obj2.position.y + obj2.height && obj1.position.y + obj1.height > obj2.position.y){

			collisionHasHappened = true;

		}
		if (collisionHasHappened){

			switch(obj1.classID){
				case 'BALL':

					switch(obj2.classID){
						case 'BRCK':
							obj1.velocity.y = obj1.velocity.y * -1
							const index = this.bricks.indexOf(obj2);
							this.bricks.splice(index, 1);
							this.removeObject(obj2);
							if(this.bricks.length <= 0){
								this.GameOver();
							}
							break;
						case 'PAWN':
							//obj1.velocity.x = obj1.velocity.x * -1
							obj1.velocity.y = obj1.velocity.y * -1
							obj1.belongsToPlayer = obj2.belongsToPlayer;
							break;
						case 'WALL':
							//obj1.velocity.x = obj1.velocity.x * -1
							obj1.velocity.y = obj1.velocity.y * -1
							break;
						default:
					
							break;
					}

					break;

				case 'PAWN':

					switch(obj2.classID){
						case 'WALL':
							obj1.velocity.y = 0;
							break;
						default:
					
							break;
					}

					break;
				default:

					break
			}

		}
	}

	}
	populateGame(){
		for(var i in this.server.clients){
			clients[i].spawnPawn(this);
			//clients[i].spawnBricks(this);
		}
		this.spawnBricks();
	}
	GameOver(){
		let winner = null;
		let currentClient = null;

		if(this.bricks.length <= 0){
			for(var i in this.server.clients){
				currentClient = clients[i];
				if(currentClient.points > winner.points){
					winner = currentClient;
				}
			}
		}
		if(winner != null){
			this.SendWinPacket(winner);
		}
	}
	SendWinPacket(client){

		let packet = Buffer.alloc(5);
		packet.write("WINR", 0);
		packet.writeUint8(client.clienNumber, 4);

		this.server.SendPacketToAll(packet);
	}
}