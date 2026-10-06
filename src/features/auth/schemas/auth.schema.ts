import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9._-]{3,}$/, 'Only letters, numbers and . _ - are allowed'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(40, 'Password must be at most 40 characters')
    .regex(/(?=.*[0-9])/, 'Must contain at least one number')
    .regex(/(?=.*[a-z])/, 'Must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Must contain at least one uppercase letter')
    .regex(/(?=.*[@#$%^&+=!])/, 'Must contain at least one special character (@#$%^&+=!)'),
  displayName: z.string().max(50, 'Display name must be at most 50 characters').optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and privacy policy',
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
