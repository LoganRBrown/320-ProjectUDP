 using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : NetworkObject
{

    new public static string classID = "PAWN";

    public bool canPlayerControl = false;

    Vector2 velocity = new Vector2(1,1);

    public float rightBoardEdge;
    public float leftBoardEdge;


    float horizontal;
    public float speed;

	void FixedUpdate()
	{
		if (canPlayerControl)
		{
			int moveX = (int)Input.GetAxisRaw("Horizontal");

			velocity.x = Accelerate(velocity.x, moveX);

			transform.position += new Vector3(velocity.x, 0, 0) * Time.fixedDeltaTime;

		}
	}
	float Accelerate(float vel, float acc)
	{
		if (acc != 0)
		{
			vel += acc * Time.fixedDeltaTime;
		}
		else
		{
			// Not pressing LEFT or RIGHT
			// SLOW DOWN!!!

			if (vel > 0)
			{ // moving right...
				acc = -1; // accelerate left
				vel += acc * Time.fixedDeltaTime;
				if (vel < 0) vel = 0;
			}

			if (vel < 0)
			{ // moving left...
				acc = 1; // accelerate right
				vel += acc * Time.fixedDeltaTime;
				if (vel > 0) vel = 0;
			}
		}

		return vel;
	}

	public override void Serialize()
	{
		// TODO ...
	}
	public override int Deserialize(Buffer packet)
	{
		return base.Deserialize(packet); 
	}
}
