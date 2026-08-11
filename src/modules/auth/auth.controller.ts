import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import { errorHandler } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Email or username already exists
 */
export const register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    const existingEmailUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }],
        },
    });

    if (existingEmailUser) {
        return errorHandler(res, "Email already exists", 400);
    }

    const existingUsernameUser = await prisma.user.findFirst({
        where: {
            OR: [{ username }],
        },
    });

    if (existingUsernameUser) {
        return errorHandler(res, "Username already exists", 400);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
        },
    });

    const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            token,
        },
    });
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier },
                { username: identifier }
            ]
        }
    });

    if (!user) {
        return errorHandler(res, "Invalid credentials", 401)
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        return errorHandler(res, "Invalid credentials", 401)
    }

    const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            token,
        },
    });
};