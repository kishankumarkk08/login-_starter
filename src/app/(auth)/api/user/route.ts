import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { hash } from "bcrypt";
import z from 'zod'

const userSchema = z.object({
  username: z.string().min(1, 'Username is required').max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Password must contain 8 characters')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password } = userSchema.parse(body);

    //check if email already exist
    const existingEmail = await db.user.findUnique({
      where: { email: email }
    })
    if (existingEmail) {
      return NextResponse.json({ user: null, message: "Email already exist" }, { status: 411 })
    }

    //check if username already exist
    const existingUsername = await db.user.findUnique({
      where: { username: username }
    })
    if (existingUsername) {
      return NextResponse.json({ user: null, message: "Username already exist" }, { status: 411 })
    }

    const hashedPass = await hash(password, 10)

    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashedPass,
      }
    })

    return NextResponse.json({ user: newUser, message: "User created successfully" }, { status: 200 })


  } catch (error) {
    return NextResponse.json({ user: null, message: "Registration failed" }, { status: 411 })
  }
}