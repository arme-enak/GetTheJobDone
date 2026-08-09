/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         title:
 *           type: string
 *           example: "Complete project documentation"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Write API documentation with Swagger"
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *           example: "pending"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           example: "medium"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-12-31T23:59:59Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-01-18T10:30:00Z"
 */