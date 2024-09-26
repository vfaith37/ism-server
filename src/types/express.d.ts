// src/types/express.d.ts

import { TokenPayload } from '../../helpers/jwt_helper'; 

declare global {
  namespace Express {
    interface Request {
      payload?: TokenPayload; // Use a specific type if you have one
    }
  }
}
