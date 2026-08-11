import { Response } from 'express';
import { AuthRequest } from '../../types/index';
import { PrismaClient } from '@prisma/client';
import redisClient from '../../cache/client';
import { errorHandler } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/users/tasks:
 *   get:
 *     summary: Get all tasks assigned to current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 */
export const getUserTasks = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const cacheKey = `user:${userId}:tasks`;

    const cachedTasks = await redisClient.get(cacheKey);
    if (cachedTasks) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            data: JSON.parse(cachedTasks),
        });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return errorHandler(res, "User not found", 404)
    }

    const tasks = await prisma.task.findMany({
        where: {
            userTasks: {
                some: {
                    userId: userId,
                },
            },
        },
    });

    await redisClient.setEx(cacheKey, 1800, JSON.stringify(tasks));

    res.status(200).json({
        success: true,
        data: tasks,
    });
};

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
export const getUser = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const cacheKey = `user:${userId}`;

    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            data: JSON.parse(cachedUser),
        });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        return errorHandler(res, "User not found", 404)
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));

    res.status(200).json({
        success: true,
        data: user,
    });
};

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Email or username already exists
 *       404:
 *         description: User not found
 */
export const patchUser = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { email, username } = req.body;

    const existingEmailUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }],
            NOT: { id: userId },
        },
    });

    if (existingEmailUser) {
        return errorHandler(res, "Email already exists", 400)
    }

    const existingUsernamelUser = await prisma.user.findFirst({
        where: {
            OR: [{ username }],
            NOT: { id: userId },
        },
    });

    if (existingUsernamelUser) {
        return errorHandler(res, "Username already exists", 400)
    }

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;

    if (Object.keys(updateData).length === 0) {
        return errorHandler(res, "No fields to update", 400)
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return errorHandler(res, "User not found", 404)
    }

    await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    await redisClient.del('users:all');
    await redisClient.del(`user:${userId}`);
    await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(user));

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
    });
};

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
    const id = req.user?.userId;

    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        return errorHandler(res, "User not found", 404)
    }

    await prisma.user.delete({
        where: { id },
    });

    await redisClient.del('users:all');
    await redisClient.del(`user:${id}`);
    await redisClient.del(`user:${id}:tasks`);

    res.status(204).json({
        success: true,
        message: 'User deleted successfully',
    });
};

/**
 * @swagger
 * /api/users/tasks/{id}/assign:
 *   post:
 *     summary: Assign a task to current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID to assign
 *     responses:
 *       200:
 *         description: Task assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task assigned successfully"
 *       404:
 *         description: Task not found
 *       400:
 *         description: User already assigned to this task
 */
export const assignTask = async (req: AuthRequest, res: Response) => {
    const userId = String(req.user?.userId) //either string or undefined
    const id = String(req.params.id); //req.params always returns string
    const cacheKey = `task:${id}`;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return errorHandler(res, "User not found", 404)
    }

    let task;
    const cachedTask = await redisClient.get(cacheKey);
    if (cachedTask) {
        task = JSON.parse(cachedTask);
    } else {
        task = await prisma.task.findUnique({
            where: { id },
        });
        if (task) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(task));
        }
    }

    if (!task) {
        return errorHandler(res, "Task not found", 404)
    }

    const existingAssignment = await prisma.userTask.findUnique({
        where: {
            userId_taskId: {
                userId: userId,
                taskId: id,
            },
        },
    });

    if (existingAssignment) {
        return errorHandler(res, "You are already assigned to this task", 400)
    }

    await prisma.userTask.create({
        data: {
            userId: userId,
            taskId: id,
        },
    });

    await redisClient.del(`user:${userId}:tasks`);

    res.json({
        success: true,
        message: `Task assigned successfully`,
    });
};