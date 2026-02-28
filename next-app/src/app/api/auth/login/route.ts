import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      { id: user._id, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET || "supersecret123",
      { expiresIn: "1d" },
    );

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        mostrarRolPub: user.mostrarRolPub,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro no servidor interno." },
      { status: 500 },
    );
  }
}
