'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { generateToken, verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

type AuthState = {
    success: boolean;
    error?: string;
    message?: string;
}

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function registerUser(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  try {
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    const validated = registerSchema.parse(rawData);

    await connectDB();

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    const user = await User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      password: validated.password,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { success: true, message: 'Registration successful' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

export async function loginUser(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  try {
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    const validated = loginSchema.parse(rawData);

    await connectDB();

    const user = await User.findOne({ email: validated.email.toLowerCase() }).select('+password');

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isPasswordValid = await user.comparePassword(validated.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { success: true, message: 'Login successful' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
    //   return { success: false, error: error.errors[0].message };
    return { success: false, error: error.message };
    }
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/');
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    await connectDB();

    const user = await User.findById(decoded.userId).select('-password').lean();

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}