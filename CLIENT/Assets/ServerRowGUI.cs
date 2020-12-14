using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ServerRowGUI : MonoBehaviour
{

    public Text txtServerName;
    public Button bttn;

    private RemoteServer server;

    public ConnectGUI parent;
   
    public void Init(RemoteServer server, ConnectGUI connectGUI)
    {

        this.server = server;

        txtServerName.text = server.serverName;

        parent = connectGUI;

    }
    public void ClickedTheButton()
    {

        ClientUDP.singleton.ConnectToServer(server.endPoint.Address.ToString(), (ushort)server.endPoint.Port);

        parent.connectionScreen.SetActive(false);
        parent.readyScreen.SetActive(true);
    }

}
