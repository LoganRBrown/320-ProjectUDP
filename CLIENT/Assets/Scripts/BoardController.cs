using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BoardController : MonoBehaviour
{
    public GameObject brick;

    public GameObject paddle;

    public GameObject ball;

    public int whoseBoard = 0;

    float brickOffset = (float)2.2;

    Vector3 brickSpawn = new Vector3((float)-8.25, 8, -10);
    void Start()
    {
        CreateBricks();

        if (whoseBoard != 0) SpawnPlayer();
    }

    
    void Update()
    {
        
    }

    void CreateBricks()
    {

        GameObject brickClone;

        for(int i = 0; i <= 23; i++)
        {

            if(i <= 7)
            {

                brickClone = Instantiate(brick);
                brickClone.transform.SetParent(transform);
                brickClone.transform.localPosition = brickSpawn + new Vector3(brickOffset * i, 0, 0);
                Brick brickScript = brickClone.GetComponent<Brick>();
                brickScript.brickNumber = i;

            }

            if(i > 7 && i <=15)
            {

                brickClone = Instantiate(brick);
                brickClone.transform.SetParent(transform);
                brickClone.transform.localPosition = brickSpawn + new Vector3(brickOffset * (i - 8), (float)-1.25, 0);
                Brick brickScript = brickClone.GetComponent<Brick>();
                brickScript.brickNumber = i;

            }

            if(i > 15)
            {

                brickClone = Instantiate(brick);
                brickClone.transform.SetParent(transform);
                brickClone.transform.localPosition = brickSpawn + new Vector3(brickOffset * (i - 16), (float)-2.5, 0);
                Brick brickScript = brickClone.GetComponent<Brick>();
                brickScript.brickNumber = i;

            }
        }

    }

    void SpawnPlayer()
    {

        GameObject player;
        

        player = Instantiate(paddle);
        player.transform.SetParent(transform);
        player.transform.localPosition = new Vector3(0, -9, -10);

        Player playerScript = player.GetComponent<Player>();

        playerScript.playerNumber = whoseBoard;


    }
}
