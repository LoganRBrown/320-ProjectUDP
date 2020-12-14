using System.Collections;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;

public class ChatScreenController : MonoBehaviour
{

    public TextMeshProUGUI chatWindow;
    public TMP_InputField inputChat;
    public TMP_InputField inputUsername;

    Buffer buffer = Buffer.Alloc(0);

    public ConnectGUI parent;

    public void CreateUsername(string txt)
    {
            ClientUDP.singleton.SendPacket(PacketBuilder.Username(txt));
            inputUsername.text = "";
    }

    public void OnButtonDisconnect()
    {
        ClientUDP.singleton.DisconnectFromServer();

        this.gameObject.SetActive(false);

        parent.connectionScreen.SetActive(true);

    }

    public void OnButtonReady()
    {
        Buffer packet = PacketBuilder.Ready();

        ClientUDP.singleton.SendPacket(packet);
    }

    public void TimeToPlay()
    {
        this.gameObject.SetActive(false);

        SceneManager.LoadScene("play", LoadSceneMode.Single);
    }

    public void AddMessageToChatDisplay(string txt)
    {
        chatWindow.text += $"{txt}\n";
    }

    public void UserDoneEditingMessage(string txt)
    {
        if (!new Regex(@"^(\s|\t)*$").IsMatch(txt))
        {
            ClientUDP.singleton.SendPacket(PacketBuilder.Chat(txt));
            inputChat.text = "";
        }

        //inputChat.Select();
        //inputChat.ActivateInputField();
    }

}
