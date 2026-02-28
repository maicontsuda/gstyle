export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import CarOption from "@/models/Option";
import { authenticateToken, roleCheck } from "@/lib/authHelpers";
// PUBLIC: Puxar opcionais (cores, jantes, packs tecnológicos) pra somar no configurador de Zero KM

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const versionId = searchParams.get("versionId");
    const type = searchParams.get("type");
    await dbConnect();
    let filter: any = { active: true };
    if (versionId) filter.versionId = versionId;
    if (type) filter.type = type;
    const opcions = await CarOption.find(filter).sort({ additionalPrice: 1 });
    return NextResponse.json(opcions);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar opcionais." },
      { status: 500 },
    );
  }
}
// ADMIN: Criar novo opcional customizável

export async function POST(req: Request) {
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
    const data = await req.json();
    const opcional = new CarOption(data);
    await opcional.save();
    return NextResponse.json(opcional, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao adicionar opcional." },
      { status: 500 },
    );
  }
}
