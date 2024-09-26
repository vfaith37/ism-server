import JWT from 'jsonwebtoken';
import createError from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import client, { getData, setData } from './init_redis';

interface UserPayload {
  name: string;
  email: string;
  password: string;
}

export interface TokenPayload {
  aud: string; // User ID
  iat?: number; // Issued at
  exp?: number; // Expiration
}

// Function to sign access token
export const signAccessToken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.ACCESS_TOKEN_SECRET as string; // Type assertion
    const options = {
      expiresIn: '1h',
      issuer: 'pickurpage.com',
      audience: userId,
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
        return;
      }
      resolve(token as string); // Type assertion to string
    });
  });
};


// Middleware to verify access token
export const verifyAccessToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next(createError.Unauthorized());

  const bearerToken = authHeader.split(' ');
  const token = bearerToken[1];

  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, payload) => {
    if (err) {
      const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
      return next(createError.Unauthorized(message));
    }
    req.payload = payload as TokenPayload; // Type assertion
    next();
  });
};

// Function to sign refresh token
export const signRefreshToken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.REFRESH_TOKEN_SECRET as string; // Type assertion
    const options = {
      expiresIn: '1y',
      issuer: 'pickurpage.com',
      audience: userId,
    };

    JWT.sign(payload, secret, options, async (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
        return;
      }

      // Set the refresh token in Redis with an expiration time
      await setData(userId, token as string, 365 * 24 * 60 * 60); // Set expiry to 1 year
      resolve(token as string); // Type assertion to string
    });
  });
};

// Function to verify refresh token
export const verifyRefreshToken = (refreshToken: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err, payload) => {
      if (err) return reject(createError.Unauthorized());

      const tokenPayload = payload as TokenPayload; // Type assertion
      const userId = tokenPayload.aud;
      if (!userId) return reject(createError.Unauthorized());

      // Get the refresh token from Redis and compare
      const tokenFromRedis = await getData(userId);
      if (refreshToken !== tokenFromRedis) return reject(createError.Unauthorized());

      resolve(userId);
    });
  });
};