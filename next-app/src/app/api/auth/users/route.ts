export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { authenticateToken, roleCheck } from "@/lib/authHelpers";

export async function GET(req: Request) {
  try {
    const auth = await authenticateToken(req);
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    const roleAuth = roleCheck(auth.user, ["admin", "dono", "funcionario"]);
    if (roleAuth.error)
      return NextResponse.json(
        { error: roleAuth.error },
        { status: roleAuth.status },
      );
    await dbConnect();
    const users = await User.find().select("-senha");
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar usuários." },
      { status: 500 },
    );
  }
}
