using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Ball : NetworkObject
{

    new public static string classID = "BALL";

    Vector2 velocity = new Vector2();

    public Rigidbody2D rb;
    public Transform player1;

    bool inPlay = false;
    Vector3 paddleOffset = new Vector3(0, 1,0);

    
    void Start()
    {

        rb = GetComponent<Rigidbody2D>();

    }

    
    void FixedUpdate()
    {

        if (!inPlay) transform.position = (player1.position + paddleOffset);

        if(Input.GetButtonDown("Jump") && !inPlay)
        {
            inPlay = true;

            rb.AddForce(Vector2.up * 500);
        }

    }

    private void OnCollisionEnter2D(Collision2D collision)
    {

        if (collision.transform.CompareTag("Brick"))
        {

            Destroy(collision.gameObject);

        }

    }

    public override void Serialize()
    {

    }

    public override int Deserialize(Buffer packet)
    {
        return base.Deserialize(packet);
    }

    /*public Buffer SendPacket()
    {
        Buffer packet;

        packet = new Buffer(7);

        return packet;
    }*/
}
