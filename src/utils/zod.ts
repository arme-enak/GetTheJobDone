import { z } from 'zod';
import { Role, TaskStatus, Priority } from '@prisma/client';

export const registerSchema = z.object({
    email: z.email('Invalid email format'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(30, 'password too long')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    role: z.enum([Role.user, Role.admin, Role.moderator]).optional(),
}).strict();;

export const loginSchema = z.object({
    identifier: z.string().min(1, 'Email or username is required'),
    password: z.string().min(1, 'Password is required'),
}).strict();;

export const userSchema = z.object({
    email: z.email('Invalid email format').optional(),
    username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long').optional(),
    role: z.enum([Role.user, Role.admin, Role.moderator]).optional(),
    isActive: z.boolean().optional(),
}).strict();;

export const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(30, 'Title too long').optional(),
    description: z.string().optional().nullable(),
    status: z.enum([TaskStatus.pending, TaskStatus.in_progress, TaskStatus.completed, TaskStatus.cancelled]).optional(),
    priority: z.enum([Priority.low, Priority.medium, Priority.high, Priority.critical]).optional(),
    dueDate: z.date().optional().nullable(),
}).strict();;