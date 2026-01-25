import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const signOptions: SignOptions = {
  expiresIn: "7d",
};

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, signOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
