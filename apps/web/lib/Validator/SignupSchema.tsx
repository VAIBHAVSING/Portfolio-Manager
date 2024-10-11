import { z } from 'zod';

export const SignupSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});
export interface SignupInterface {
    username: string;
    password: string;
    name: string;
    email: string;
  }