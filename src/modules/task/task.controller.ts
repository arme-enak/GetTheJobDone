import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export const getTask = async (req: Request, res: Response) => {
    const id = String(req.params.id); //req.params always returns string

    const task = await prisma.task.findUnique({
        where: { id },
    });

    if (!task) {
        return errorHandler(res, "Task not found", 404)
    }

    res.status(200).json({
        success: true,
        data: task,
    });
};

export const getAllTasks = async (req: Request, res: Response) => {
    const tasks = await prisma.task.findMany();

    res.status(200).json({
        success: true,
        data: tasks,
    });
};