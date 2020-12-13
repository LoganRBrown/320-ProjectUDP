using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class PacketBuilder
{

    static int previousInputH = 0;

    public static Buffer CurrentInput()
    {
        int h = (int)Input.GetAxisRaw("Horizontal"); // (-1 | 0 | 1)

        if (h == previousInputH) return null; //do nothign...

        previousInputH = h;

        Buffer b = Buffer.Alloc(5);

        b.WriteString("INPT", 0);
        b.WriteInt8((sbyte)h, 4);

        return b;
    }

    public static Buffer Chat(string message)
    {
        int packetLength = 5 + message.Length;
        Buffer packet = Buffer.Alloc(packetLength);

        packet.WriteString("CHAT", 0);
        packet.WriteUInt8((byte)message.Length, 4);
        packet.WriteString(message, 5);

        return packet;
    }

    public static Buffer Username(string username)
    {
        int packetLength = 5 + username.Length;
        Buffer packet = Buffer.Alloc(packetLength);

        packet.WriteString("USRN", 0);
        packet.WriteUInt8((byte)username.Length, 4);
        packet.WriteString(username);

        return packet;
    }

    public static Buffer Ready()
    {
        Buffer packet = Buffer.Alloc(5);

        packet.WriteString("REDY", 0);
        packet.WriteUInt8(1, 4);

        return packet;
    }
}
