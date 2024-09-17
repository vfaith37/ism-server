import jwt from 'jsonwebtoken';
import createError from 'http-errors';

// Define the function that signs the access token
export const signAccessToken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = {}; // Empty payload for now
    const secret = process.env.ACCESS_TOKEN_SECRET_KEY || 'bb64af2b0ead7c09ddfebb2d46e6dadc1d204bad047a2188d2be7e9b0942a031';
    const options = {
      expiresIn: '1h', // Token expires in 1 hour
      issuer: 'FigoSavic', // The issuer of the token
      audience: userId, // The audience (userId)
    };

    jwt.sign(payload, secret, options, (error, token) => {
      if (error) {
        console.error(error.message); // Log the error message
        return reject(createError.InternalServerError()); // Reject with an internal server error
      }
      resolve(token!); // Resolve the generated token
    });
  });
};
