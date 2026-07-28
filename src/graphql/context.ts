import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/jwt';

const prisma = new PrismaClient();

export interface GraphQLContext {
  prisma: PrismaClient;
  req: Request;
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export async function createContext({ req }: { req: Request }): Promise<GraphQLContext> {
  const authHeader = req.headers.get('authorization');
  let user = undefined;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = verifyToken(token);
      user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
    }
  }
  return {
    prisma,
    req,
    user,
  };
}