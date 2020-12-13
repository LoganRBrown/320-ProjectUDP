const Game = require("./class-game.js").Game;
const Client = require("./class-client.js").Client;

exports.Server = class Server{
	constructor(){

		this.clients = [];
		this.readyCount = 0;

		//create socket:
		this.sock = require("dgram").createSocket("udp4");

		//setup event listener
		this.sock.on("error", (e)=>this.onError(e));
		this.sock.on("listening", ()=>this.onStartListen());
		this.sock.on("message", (msg,rinfo)=>this.onPacket(msg,rinfo));

		this.game = new Game(this);

		// bind socket to port: (Start Listening)
		this.port = 320;
		this.sock.bind(this.port);
	}
	onError(e){
		console.log("ERROR: "+e);
	}
	onStartListen(){
		console.log("Server is listening on port "+this.port);
	}
	onPacket(msg, rinfo){

		if (msg.length < 4) return;

		const packetID = msg.slice(0,4).toString();

		const c = this.lookupClient(rinfo);
		if(c){
			c.onPacket(msg, this.game)
		}
		else{
			if (packetID == "JOIN") {
				this.makeClient(rinfo);
			}
			if (packetID == "REDY"){
				c.isReady = true;
			}
			if (packetID == "USRN"){
				const nameLength = msg.slice(4,5);
				c.username = msg.slice(5, nameLength).toString();
			}
			if(packetID == "CHAT"){
				this.sendChatToClients(msg, c);
			}
		}
		
	}
	sendChatToClients(msg, client){
		if(msg.length < 5) return;

		const msgLength = msg.slice(4,5);
		const chatMsg = msg.slice(5, msgLength).toString();
		const clientNameLength = client.username.length;
		const clientName = client.username;

		let packLength = msgLength += clientNameLength;

		const packet = Buffer.alloc(5 + packLength)
		packet.write("CHAT",0);
		packet.writeUInt8(clientNameLength,4);
		packet.writeUInt16BE(msgLength, 5);
		packet.write(clientName, 7);
		packet.write(chatMsg, 7 + clientNameLength);

		this.SendPacketToAll(packet);


	}
	getKeyFromRinfo(rinfo){
		return rinfo.address+":"+rinfo.port;

	}
	lookupClient(rinfo){
		const key = this.getKeyFromRinfo(rinfo);
		return this.clients[key];

	}
	makeClient(rinfo){
		const key = this.getKeyFromRinfo(rinfo);
		const client = new Client(rinfo);
		this.clients[key] = client;
		client.clientNumber = this.clients.indexOf(client);

		//depending on scene (and other conditions) spawn pawn:
		//client.spawnPawn(this.game);


		this.showClientList();

		// TODO: send CREATE replication packets to client for every object...
		const packet = this.game.makeREPL(false);

		this.sendPacketToClient(packet, client); // TODO: needs an ACK!!

		//const packet2 = Buffer.alloc(5);
		//packet2.write("PAWN", 0);
		//packet2.writeUInt8(client.pawn.networkID, 4);
		//this.sendPacketToClient(packet2, client);

		return client;
	}
	disconnectClient(client){

		if(client.pawn) this.game.removeObject(client.pawn);

		const key = this.getKeyFromRinfo(client.rinfo);

		delete this.client[key];

		
	}
	showClientList(){
		console.log(" ============== " +Object.keys(this.clients).length+" clients connected ================");
		for(var key in this.clients){
			console.log(key);
		}
	}
	getPlayer(num=0){

		num = parseInt(num);

		let i = 0;

		for(var key in this.clients){
			if(num == i) return this.clients[key];
			i++
		}
	}
	SendPacketToAll(packet){
		/*this.clients.forEach(c=>{

			this.sendPacketToClient(packet, c);

		});*/

		for(var key in this.clients){
			this.sendPacketToClient(packet, this.clients[key]);
		}
	}
	sendPacketToClient(packet, client){
		this.sock.send(packet,0,packet.length,client.rinfo.port, client.rinfo.address, ()=>{});
	}
	update(game){
		//check clients for disconnects, etc.

		for(let key in this.clients){
			this.clients[key].update(game);
			if(this.clients[key].isReady == true){
				this.readyCount++;
				if(this.readyCount >= 2){
					const packet = Buffer.alloc(4);
					packet.write("PLAY", 0);
					SendPacketToAll(packet);
				}
			}

		}
	}
}