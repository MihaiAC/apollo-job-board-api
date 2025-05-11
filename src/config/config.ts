import dotenv from "dotenv";
dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL!;
export const JWT_KEY = process.env.JWT_KEY!;
export const JWT_ALGORITHM = process.env.JWT_ALGORITHM!;
export const JWT_EXPIRES_MINUTES = Number(
  process.env.JWT_EXPIRATION_TIME_MINUTES
);
