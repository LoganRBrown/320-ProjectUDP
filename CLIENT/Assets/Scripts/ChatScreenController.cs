using System.Collections;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using TMPro;
using UnityEngine;

public class ChatScreenController : MonoBehaviour
{

    public TextMeshProUGUI chatWindow;
    public TMP_InputField inputChat;
    public TMP_InputField inputUsername; 

    Buffer buffer = Buffer.Alloc(0);

    public ClientUDP client;

    public void CreateUsername(string txt)
    {
        if (!new Regex(@"^(\s|\t)*$").IsMatch(txt))
        {
            client.SendPacket(PacketBuilder.Username(txt));
            inputUsername.text = "";
        }
    }

    public void OnButtonDisconnect()
    {
        client.DisconnectFromServer();
    }

    public void OnButtonReady()
    {
        Buffer packet = PacketBuilder.Ready();

        this.gameObject.SetActive(false);

        client.SendPacket(packet);
    }

    public void AddMessageToChatDisplay(string txt)
    {
        chatWindow.text += $"{txt}\n";
    }

    public void UserDoneEditingMessage(string txt)
    {
        if (!new Regex(@"^(\s|\t)*$").IsMatch(txt))
        {
            client.SendPacket(PacketBuilder.Chat(txt));
            inputChat.text = "";
        }

        inputChat.Select();
        inputChat.ActivateInputField();
    }

}
