import { Response } from 'express';
import { AuthRequest } from '../../types/index';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../utils/hash';
import redisClient from '../../cache/client';
import { errorHandler } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                     $ref: '#/components/schemas/AdminUserResponse'
 *       403:
 *         description: Access denied. Admins only.
 */
export const getUsersByAdmin = async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
        return errorHandler(res, "Access denied. Admins only.", 403)
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: req.user?.userId },
    });

    if (!adminUser) {
        return errorHandler(res, "Admin not found", 404)
    }

    const cacheKey = 'users:all';
    const cachedUsers = await redisClient.get(cacheKey);

    if (cachedUsers) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            data: JSON.parse(cachedUsers),
        });
    }

    const users = await prisma.user.findMany({
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

    await redisClient.setEx(cacheKey, 1800, JSON.stringify(users));

    res.status(200).json({
        success: true,
        data: users,
    });
};

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserByAdminRequest'
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: "User created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AdminUserResponse'
 *       400:
 *         description: Email or username already exists
 *       403:
 *         description: Access denied. Admins only.
 */
export const createUserByAdmin = async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
        return errorHandler(res, "Access denied. Admins only.", 403)
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: req.user?.userId },
    });

    if (!adminUser) {
        return errorHandler(res, "Admin not found", 404)
    }

    const { email, username, password, role } = req.body;

    const existingEmailUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }],
        },
    });

    if (existingEmailUser) {
        return errorHandler(res, "Email already exists", 400)
    }

    const existingUsernamelUser = await prisma.user.findFirst({
        where: {
            OR: [{ username }],
        },
    });

    if (existingUsernamelUser) {
        return errorHandler(res, "Username already exists", 400)
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
            role: role,
        },
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

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
    });
};

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserByAdminRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: "User updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AdminUserResponse'
 *       400:
 *         description: No fields to update
 *       403:
 *         description: Access denied. Admins only.
 *       404:
 *         description: User not found
 */
export const pathUserByAdmin = async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    const id = String(req.params.id); //req.params always returns string
    const { role, isActive } = req.body;

    const adminUser = await prisma.user.findUnique({
        where: { id: req.user?.userId },
    });

    if (!adminUser) {
        return errorHandler(res, "Admin not found", 404)
    }

    if (userRole !== 'admin') {
        return errorHandler(res, "Access denied. Admins only.", 403)
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
        return errorHandler(res, "No fields to update", 400)
    }

    const user = await prisma.user.update({
        where: { id },
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
    }).catch(() => { return new Error("NotFound") });

    await redisClient.del('users:all');
    await redisClient.del(`user:${id}`);

    res.json({
        success: true,
        message: 'User updated successfully',
        data: user,
    });
};

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       403:
 *         description: Access denied. Admins only.
 *       404:
 *         description: User not found
 */
export const deleteUserByAdmin = async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    const id = String(req.params.id); //req.params always returns string

    if (userRole !== 'admin') {
        return errorHandler(res, "Access denied.You can only delete your own account.", 403)
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: req.user?.userId },
    });

    if (!adminUser) {
        return errorHandler(res, "Admin not found", 404)
    }

    await prisma.user.delete({
        where: { id },
    }).catch(() => { return new Error("NotFound") });

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
 * /api/admin/tasks:
 *   post:
 *     summary: Create a new task (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskByAdminRequest'
 *     responses:
 *       201:
 *         description: Task created successfully
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
 *                   example: "Task created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AdminTaskResponse'
 *       403:
 *         description: Access denied. Admins only.
 */
export const createTaskByAdmin = async (req: AuthRequest, res: Response) => {
    const { title, description, status, priority, dueDate } = req.body;
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
        return errorHandler(res, "Access denied. Admins olny.", 403)
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: req.user?.userId },
    });

    if (!adminUser) {
        return errorHandler(res, "Admin not found", 404)
    }

    const task = await prisma.task.create({
        data: {
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null
        },
    });

    await redisClient.del('tasks:all');

    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
    });
};

/**
 * @swagger
 * /api/admin/tasks/{id}:
 *   patch:
 *     summary: Update a task (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskByAdminRequest'
 *     responses:
 *       200:
 *         description: Task updated successfully
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
 *                   example: "Task updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AdminTaskResponse'
 *       403:
 *         description: Access denied. Admins only.
 *       404:
 *         description: Task not found
 */
export const patchTaskByAdmin = async (req: AuthRequest, res: Response) => {
    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.user?.userId;
    const id = String(req.params.id); //req.params always returns string
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
        return errorHandler(res, "Access denied. Admins olny.", 403)
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: req.user?.userId },
    });

    if (!adminUser) {
        return errorHandler(res, "Admin not found", 404)
    }

    const existingTask = await prisma.userTask.findFirst({
        where: {
            taskId: id,
            userId: userId,
        },
    });

    if (!existingTask) {
        return errorHandler(res, "Task not found", 404)
    }

    const task = await prisma.task.update({
        where: { id },
        data: {
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
        },
    });

    await redisClient.del(`task:${id}`);
    await redisClient.del('tasks:all');

    res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
    });
};

/**
 * @swagger
 * /api/admin/tasks/{id}:
 *   delete:
 *     summary: Delete a task (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       403:
 *         description: Access denied. Admins only.
 *       404:
 *         description: Task not found
 */
export const deleteTaskByAdmin = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const id = String(req.params.id); //req.params always returns string
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
        return errorHandler(res, "Access denied. Admins olny.", 403)
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: req.user?.userId },
    });

    if (!adminUser) {
        return errorHandler(res, "Admin not found", 404)
    }

    const existingTask = await prisma.userTask.findFirst({
        where: {
            taskId: id,
            userId: userId,
        },
    });

    if (!existingTask) {
        return errorHandler(res, "Task not found", 404)
    }

    await prisma.task.delete({
        where: { id },
    });

    await redisClient.del(`task:${id}`);
    await redisClient.del('tasks:all');

    res.status(204).json({
        success: true,
        message: 'Task deleted successfully',
    });
};