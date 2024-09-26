import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: any; // Adjust this to match your Prisma user type if you have a defined type for `user`
}

const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'net ninja secret', (err: jwt.VerifyErrors | null, decodedToken: JwtPayload | string | undefined) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

const checkUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'net ninja secret', async (err: jwt.VerifyErrors | null, decodedToken: JwtPayload | string | undefined) => {
      if (err || typeof decodedToken !== 'object' || !decodedToken) {
        res.locals.user = null;
        next();
      } else {
        const { id } = decodedToken as JwtPayload; // Assuming the token has an `id` property

        try {
          const user = await prisma.users.findUnique({
            where: { userId: id as string }, // Adjust `id` to the correct type from your Prisma schema
          });
          res.locals.user = user;
        } catch (err) {
          res.locals.user = null;
        }
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

export { requireAuth, checkUser };
