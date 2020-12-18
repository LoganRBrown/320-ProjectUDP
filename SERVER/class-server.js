const Game = require("./class-game.js").Game;
const Client = require("./class-client.js").Client;

exports.Server = class Server{
	constructor(){

		this.clients = [];
		this.readyCount = 1;
		this.doOnce = true;
		this.serverName = "Logan's Server";

		//create socket:
		this.sock = require("dgram").createSocket("udp4");

		//setup event listener
		this.sock.on("error", (e)=>this.onError(e));
		this.sock.on("listening", ()=>this.onStartListen());
		this.sock.on("message", (msg,rinfo)=>this.onPacket(msg,rinfo));

		this.game = new Game(this);

		// bind socket to port: (Start Listening)
		this.port = 320;
		this.timeUntilNextBroadcast = 0;
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
		}
		
	}
	sendChatToClients(msg, client){
		if(msg.length < 5) return;

		const msgLength = msg.readUInt8(4);
		const chatMsg = msg.slice(5, 5+msgLength).toString();
		const clientNameLength = client.username.length;
		const clientName = client.username;

		let packLength = Number(msgLength + clientNameLength);


		const packet = Buffer.alloc(5 + packLength)
		packet.write("CHAT",0);
		packet.writeUInt8(clientNameLength,4);
		packet.writeUInt16BE(msgLength, 5);
		packet.write(clientName, 7);
		packet.write(chatMsg, 7 + clientNameLength);

		this.SendPacketToAll(packet);

		console.log("Packet sent");


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

		delete this.clients[key];

		
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

		for(var key in this.clients){
			this.sendPacketToClient(packet, this.clients[key]);
			//console.log("Packet sent to all");
		}
	}
	sendPacketToClient(packet, client){
		this.sock.send(packet,0,packet.length,321, client.rinfo.address, ()=>{});
	}
	broadcastPacket(packet){

		const clientListenPort = 321;

		this.sock.send(packet, 0, packet.length, clientListenPort, undefined);

	}
	broadcastServerHost(){

		const nameLength = Number(this.serverName.length);
		const packet = Buffer.alloc(7 + nameLength);

		packet.write("HOST", 0);
		packet.writeUInt16BE(this.port, 4);
		packet.writeUInt8(nameLength, 6);
		packet.write(this.serverName, 7);

		this.broadcastPacket(packet);
	}
	beginPlay(){

		const packet = Buffer.alloc(4);
		packet.write("PLAY", 0);
		this.SendPacketToAll(packet);

		//setTimeout(function(){

			for(let c in this.clients){
			this.clients[c].spawnPawn(this.game);

			const packet2 = Buffer.alloc(5);
			packet2.write("PAWN", 0);
			packet2.writeUInt8(this.clients[c].pawn.networkID, 4);
			this.sendPacketToClient(packet2, this.clients[c]);
		}


		this.game.spawnBricks();

		//this.game.spawnBall();

		//}, 3000);


	}
	update(game){
		//check clients for disconnects, etc.

		for(let key in this.clients){
			this.clients[key].update(game);
			if(this.clients[key].isReady == true){
				this.readyCount++;
				if(this.readyCount >= 2 && this.doOnce){
					this.beginPlay();
					this.doOnce = false;
				}
			}

		}

		this.timeUntilNextBroadcast -= game.dt;
		if(this.timeUntilNextBroadcast <= 0){
			this.timeUntilNextBroadcast = 1.5

			this.broadcastServerHost();
		}
	}
}