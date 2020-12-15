const Pawn = require("./class-pawn.js").Pawn;
const Game = require("./class-game.js").Game;
const Brick = require("./class-brick.js").Brick;


exports.Client = class Client {

	static TIMEOUT = 8;

	constructor(rinfo){
		this.rinfo = rinfo;
		this.input = {
			axisH:0,
			axisV:0,
		};

		this.pawn = null;
		this.timeSinceLastPacket = Game.Singleton.time; // measured in seconds
		this.points = 0;
		this.clientNumber = 0;
		this.isReady = false;
		this.username = "Default"; 

	}
	spawnPawn(game){

		if(this.pawn) return;

		this.pawn = new Pawn();
		this.pawn.belongsToPlayer = this.clientNumber;
		game.spawnObject( this.pawn );

	}
	
	update(){

		const game = Game.Singleton;

		if(game.time > this.timeSinceLastPacket + Client.TIMEOUT){
			game.server.disconnectClient(this);

		}
		
	}
	onPacket(packet, game){
		if(packet.length < 4) return;
		const packetID = packet.slice(0,4).toString();

		// no access to game?
		this.timeSinceLastPacket = game.time;

		switch(packetID){
			case("INPT"):
				if(packet.length < 5) return;
				this.input.axisH = packet.readInt8(4);

				//send input to Pawn object
				if(this.pawn) this.pawn.input = this.input;

				break;
			case("REDY"):

				this.isReady = true;

				break;
			case("USRN"):

				const nameLength = packet.readUInt8(4);
				this.username = packet.slice(5, 5+nameLength).toString();

				break;
			case("CHAT"):

				game.server.sendChatToClients(packet, this);

				break;


			default:
				console.log("ERROR: Packet not recognized");
				console.log(packetID);
		}
	}

}