import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authSchema, signInSchema } from '../../helpers/validationShema';
import { signAccessToken } from '../../helpers/signAccessToken';

const prisma = new PrismaClient();

// User Registration
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // Validate request body using authSchema
    await authSchema.validate(req.body);

    // Check if the user already exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Sign JWT token
    const token = signAccessToken(newUser.userId);

    return res.status(201).json({ message: 'User registered', token });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// User Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Validate request body using signInSchema
    await signInSchema.validate(req.body);

    // Find user by email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.password) {
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
}


    // Sign JWT token
    const token = signAccessToken(user.userId);

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
