using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Net;
using System.Net.Sockets;

public class ClientUDP : MonoBehaviour
{
	private static ClientUDP _singleton;
	public static ClientUDP singleton
	{
		get { return _singleton; }
		private set { _singleton = value; }
	}

	static UdpClient sockSending = new UdpClient();
	static UdpClient sockReceive = new UdpClient();

	public List<RemoteServer> availableGameServers = new List<RemoteServer>();

	//string serverHost = "127.0.0.1";
	//ushort serverPort = 320;

	/// <summary>
	/// Most recent ball update packet 
	/// that has been recieved
	/// </summary>
	uint ackPaddleUpdate = 0;

	public Transform paddle;

	void Start()
	{
		if (singleton != null)
		{
			//alread have a clientUDP...
			Destroy(gameObject);
		}
		else
		{
			singleton = this;
			DontDestroyOnLoad(gameObject);
			ListenForPackets();
		}
	}

	public void ConnectToServer(string host, ushort port)
	{
		IPEndPoint ep = new IPEndPoint(IPAddress.Parse(host), port);
		sockSending = new UdpClient(ep.AddressFamily);
		sockSending.Connect(ep);

		// set up recieve loop (async)
		//ListenForPackets();

		// send a packet to the server (async)
		SendPacket(Buffer.From("JOIN"));
	}

	/// <summary>
	/// This function listens for packets from the server
	/// </summary>
	async void ListenForPackets()
	{

		while (true)
		{
			UdpReceiveResult res;
			try
			{
				res = await sockReceive.ReceiveAsync();
				ProcessPacket(res);
			}
			catch
			{
				print("FAIL");
				break;
			}
		}
	}
	/// <summary>
	/// This function processes a packet and decides what to do next
	/// </summary>
	/// <param name="packet">The packet to send</param>
	private void ProcessPacket(UdpReceiveResult res)
	{
		Buffer packet = Buffer.From(res.Buffer);

		IPAddress sender = res.RemoteEndPoint.Address;

		if (packet.Length < 4) return;

		string id = packet.ReadString(0, 4);
		switch (id)
		{
			case "REPL":
				ProcessPacketREPL(packet);
				break;
			case "PAWN": //extra packet to indentify WHICH object (network ID) the player controls

				if (packet.Length < 5) return;

				byte networkID = packet.ReadUInt8(4);

				NetworkObject obj = NetworkObject.GetObjectbyNetworkID(networkID);
				if (obj)
				{
					Player p = (obj as Player);

					if (p != null) p.canPlayerControl = true;
				}

				break;
			case "HOST":

				if (packet.Length < 7) return;

				ushort port = packet.ReadUInt16BE(4);
				int nameLength = packet.ReadUInt8(6);

				if (packet.Length < 7 + nameLength) return;

				string name = packet.ReadString(7, nameLength);

				AddToServerList(new RemoteServer(res.RemoteEndPoint, name));

				break;
		}
	}

	private void AddToServerList(RemoteServer server)
	{
		if (!availableGameServers.Contains(server))
		{
			// add
			availableGameServers.Add(server);
		}
	}

	private void ProcessPacketREPL(Buffer packet)
	{
		if (packet.Length < 5) return;

		int replType = packet.ReadUInt8(4);

		if (replType != 1 && replType != 2 && replType != 3) return;

		int offset = 5;

		while (offset < packet.Length)
		{
			int networkID = 0;


			switch (replType)
			{
				case 1: // create
					if (packet.Length < offset + 5) return;

					networkID = packet.ReadUInt8(offset + 4);

					string classID = packet.ReadString(offset, 4);

					if (NetworkObject.GetObjectbyNetworkID(networkID) != null) return; // ignore if object exists

					NetworkObject obj = ObjectRegistry.SpawnFrom(classID);

					if (obj == null) return; //ERROR: class ID not Found!

					offset += 4; // trim out classID off beginning of packet data
					Buffer chunk = packet.Slice(offset);
					offset += obj.Deserialize(chunk);

					NetworkObject.AddObject(obj);
					break;
				case 2: // update

					//lookup the object, using network id
					if (packet.Length < offset + 5) return;

					networkID = packet.ReadUInt8(offset + 4);


					NetworkObject obj2 = NetworkObject.GetObjectbyNetworkID(networkID);

					if (obj2 == null) return;

					offset += 4; // trim out classID off beginning of packet data
					obj2.Deserialize(packet.Slice(offset));

					//update it

					break;
				case 3: // delete

					if (packet.Length < offset + 1) return;

					networkID = packet.ReadUInt8(offset);

					//lookup the object, using network id

					NetworkObject obj3 = NetworkObject.GetObjectbyNetworkID(networkID);

					if (obj3 == null) return;

					//delete it
					NetworkObject.RemoveObject(networkID);

					Destroy(obj3.gameObject);

					offset++;

					break;
			}
		}
	}

	/// <summary>
	/// This function sends a packet (current to localhost:320)
	/// </summary>
	/// <param name="packet"></param>
	async public void SendPacket(Buffer packet)
	{

		if (sockSending == null) return;
		if (!sockSending.Client.Connected) return;

		// TODO: remove literals from next line
		await sockSending.SendAsync(packet.bytes, packet.bytes.Length);
	}

	/// <summary>
	/// When destroying, clean up objects.
	/// </summary>
	private void OnDestroy()
	{
		if (sockSending != null) sockSending.Close();
		if (sockReceive != null)
		{
			print("closing socket");
			sockReceive.Close();
		}
	}
}
