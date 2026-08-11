import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import redisClient from '../../cache/client';
import { errorHandler } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
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
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
export const getTask = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id); //req.params always returns string
    const cacheKey = `task:${id}`;

    const cachedTask = await redisClient.get(cacheKey);
    if (cachedTask) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            data: JSON.parse(cachedTask),
        });
    }

    const task = await prisma.task.findUnique({
        where: { id },
    });

    if (!task) {
        return errorHandler(res, "Task not found", 404)
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(task));

    res.status(200).json({
        success: true,
        data: task,
    });
};

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
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
export const getAllTasks = async (req: AuthRequest, res: Response) => {
    const cacheKey = 'tasks:all';

    try {
        const cacheStartTime = Date.now();
        const cachedTasks = await redisClient.get(cacheKey); // .catch(() => null)
        if (cachedTasks) {
            const cacheDuration = Date.now() - cacheStartTime;
            console.log(`✅ CACHE HIT - Total: ${cacheDuration}ms`);
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: JSON.parse(cachedTasks),
            });
        }
    } catch (err) { console.log(err) }

    const dbStartTime = Date.now();
    const tasks = await prisma.task.findMany();
    const dbDuration = Date.now() - dbStartTime;
    console.log(`⏳ CACHE MISS - Total: ${dbDuration}ms`);

    //if (redisClient.isOpen) { ... }
    try {
        await redisClient.setEx(cacheKey, 1800, JSON.stringify(tasks));
    } catch (err) { console.log(err) }

    res.status(200).json({
        success: true,
        data: tasks,
    });
};