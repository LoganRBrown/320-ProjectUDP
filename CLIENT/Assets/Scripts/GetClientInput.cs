using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GetClientInput : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {

        Buffer b = PacketBuilder.CurrentInput();

        if (b != null) ClientUDP.singleton.SendPacket(b);
        
    }
}
