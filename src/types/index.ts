import { Request } from 'express';
import { Role, TaskStatus, Priority } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

// export interface ApiResponse<T> {
//     success: boolean;
//     message: string;
//     data?: T;
//     error?: string;
// }

export interface User {
    id: string;
    email: string;
    username: string;
    password: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    userTasks?: UserTask[];
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;

    userTasks?: UserTask[];
}

export interface UserTask {
    userId: string;
    taskId: string;
    assignedAt: Date;
}
