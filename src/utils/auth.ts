import jwt, { JwtPayload as BaseJwtPayload, Algorithm } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createSecretKey } from "crypto";
import { JWT_KEY, JWT_ALGORITHM, JWT_EXPIRES_MINUTES } from "../config/config";
import { Context } from "../graphql/context";
import { GraphQLFieldResolver, GraphQLResolveInfo } from "graphql";

interface JwtPayload extends BaseJwtPayload {
  id: number;
  role: string;
}

const SECRET_KEY_OBJECT = createSecretKey(Buffer.from(JWT_KEY, "utf-8"));

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET_KEY_OBJECT, {
    algorithm: JWT_ALGORITHM as jwt.Algorithm,
    expiresIn: JWT_EXPIRES_MINUTES * 60,
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, SECRET_KEY_OBJECT, {
    algorithms: [JWT_ALGORITHM as Algorithm],
  });

  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }

  const { id, role } = decoded as Partial<JwtPayload>;

  if (typeof id !== "number" || typeof role !== "string") {
    throw new Error("Malformed token");
  }

  return decoded as JwtPayload;
}

export function requireRole<Source, Args, Return>(
  roles: string[],
  resolver: GraphQLFieldResolver<Source, Context, Args, Return>
): GraphQLFieldResolver<Source, Context, Args, Return> {
  return (source, args, context, info) => {
    if (!context.auth || !roles.includes(context.auth.role)) {
      throw new Error("Unauthorized");
    }
    return resolver(source, args, context, info);
  };
}
