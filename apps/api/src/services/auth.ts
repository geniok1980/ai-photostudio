import jwt from 'jsonwebtoken';

const getSecret = (): string => {
  return process.env.JWT_SECRET || 'ai-photostudio-secret-key';
};

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export function generateToken(user: { id: string; email: string; role: string }): string {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}
