using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : NetworkObject
{

    new public static string classID = "PAWN";

    public bool canPlayerControl = false;
    public float rightBoardEdge;
    public float leftBoardEdge;


    float horizontal;
    public float speed;
    
    void Start()
    {
        
    }

    
    void Update()
    {

        horizontal = Input.GetAxis("Horizontal");

        transform.Translate(Vector2.right * horizontal * Time.deltaTime * speed);

        if (transform.position.x < leftBoardEdge) transform.position = new Vector2(leftBoardEdge, transform.position.y);

        if (transform.position.x > rightBoardEdge) transform.position = new Vector2(rightBoardEdge, transform.position.y);

    }
}
