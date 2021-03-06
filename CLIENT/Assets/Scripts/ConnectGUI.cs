﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class ConnectGUI : MonoBehaviour
{

    public InputField inputIP;
    public InputField inputPort;
    public GameObject connectionScreen;
    public GameObject readyScreen;

    public ServerRowGUI prefabServerRowGUI;

    float timeUntilrefresh = 1;

    List<ServerRowGUI> rows = new List<ServerRowGUI>();

    public void DirectConnect()
    {

        if (inputIP == null) return;
        if (inputPort == null) return;

        string addr = inputIP.text;
        string port = inputPort.text;

        ushort portNum = 0;

        System.UInt16.TryParse(port, out portNum);

        ClientUDP.singleton.ConnectToServer(addr, portNum);

        readyScreen.SetActive(true);
        connectionScreen.SetActive(false);

        //SceneManager.LoadScene("play", LoadSceneMode.Single);

    }

    private void Update()
    {

        timeUntilrefresh -= Time.deltaTime;
        if(timeUntilrefresh <= 0)
        {
            timeUntilrefresh = 2;
            UpdateServerList();
        }

    }

    public void UpdateServerList()
    {
        foreach(ServerRowGUI row in rows)
        {
            if(row != null)
            {
                Destroy(row.gameObject);
            }
        }

        rows.Clear();

        int i = 0;
        foreach(RemoteServer server in ClientUDP.singleton.availableGameServers)
        {

            ServerRowGUI row = Instantiate(prefabServerRowGUI, transform);

            RectTransform rt = (RectTransform)row.transform;
            rt.localScale = Vector3.one;
            rt.sizeDelta = new Vector2(500, 50);
            rt.anchorMax = rt.anchorMin = new Vector2(0.5f, 0.5f);
            rt.pivot = new Vector2(0.5f, 0.5f);

            rt.anchoredPosition = new Vector2(0, - i * 70);

            row.Init(server, this);
            row.transform.SetParent(connectionScreen.transform);
            rows.Add(row);
            i++;
        }
    }

}
