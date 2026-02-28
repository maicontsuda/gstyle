import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Função auxiliar para validar token nas rotas de API do Next.js
export async function authenticateToken(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return { error: 'Acesso negado. Token não fornecido.', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123');
    return { user: decoded, status: 200 };
  } catch (error) {
    return { error: 'Token inválido.', status: 403 };
  }
}

export function roleCheck(user: any, allowedRoles: string[]) {
  if (!allowedRoles.includes(user.tipo_usuario)) {
    return { error: 'Acesso negado para este nível de permissão.', status: 403 };
  }
  return { status: 200 };
}
