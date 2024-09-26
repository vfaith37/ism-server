import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../helpers/jwt_helper';
import client from '../../helpers/init_redis';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authSchema } from '../../helpers/validationShema';

const prisma = new PrismaClient();

interface UserPayload {
  name: string;
  email: string;
  password: string;
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result: UserPayload = await authSchema.validate(req.body);

      // Check if user already exists
      const doesExist = await prisma.users.findUnique({
        where: { email: result.email },
      });
      if (doesExist) {
        throw createError.Conflict(`${result.email} is already registered`);
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(result.password, 10);
      const user = await prisma.users.create({
        data: {
          name: result.name,
          email: result.email,
          password: hashedPassword,
        },
      });

      const accessToken = await signAccessToken(user.userId);
      const refreshToken = await signRefreshToken(user.userId);

      res.send({ accessToken, refreshToken });
    } catch (error) {
      // if (error.isJoi === true) error.status = 422;
      next(error);
    }
  }

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result: UserPayload = await authSchema.validate(req.body);

       // Find user by email
       const user = await prisma.users.findUnique({
        where: { email: result.email },
      });
  
      // If user not found
      if (!user) throw new Error('incorrect email');
  
      // Validate if the user password is not null before comparison
      if (!user.password) {
        throw new Error('input password');
      }

      // Validate password
      const isMatch = bcrypt.compare(result.password, user.password);

      if (!isMatch) {
        throw createError.Unauthorized('Username/password not valid');
      }

      const accessToken = await signAccessToken(user.userId);
      const refreshToken = await signRefreshToken(user.userId);

      res.send({ accessToken, refreshToken });
    } catch (error) {
      // if (error.isJoi === true) {
      //   return next(createError.BadRequest('Invalid Username/Password'));
      // }
      next(error);
    }
  }

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);

      const accessToken = await signAccessToken(userId);
      const newRefreshToken = await signRefreshToken(userId);
      res.send({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      next(error);
    }
  }

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);

      // Delete the refresh token from Redis
      // client.DEL(userId, (err, val) => {
      //   if (err) {
      //     console.log(err.message);
      //     throw createError.InternalServerError();
      //   }
      //   console.log(val);
      //   res.sendStatus(204);
      // });
    } catch (error) {
      next(error);
    }
  }