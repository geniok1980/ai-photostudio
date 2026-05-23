import type { JwtPayload } from '../services/auth';

declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}
