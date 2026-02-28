import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { authenticateToken, roleCheck } from "@/lib/authHelpers";


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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
    const { anexos } = await req.json();

    let novosAnexos = [];
    if (anexos && Array.isArray(anexos)) {
      novosAnexos = anexos.map((a: any) => ({ ...a, dataAdicao: new Date() }));
    } else {
      return NextResponse.json(
        { error: "Nenhum anexo fornecido." },
        { status: 400 },
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $push: { anexos: { $each: novosAnexos } } },
      { new: true },
    ).select("-senha");

    if (!user)
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao adicionar anexos." },
      { status: 500 },
    );
  }
}
