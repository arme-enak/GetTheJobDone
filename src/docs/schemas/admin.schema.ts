/**
 * @swagger
 * components:
 *   schemas:
 *     AdminUserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         username:
 *           type: string
 *           example: "john_doe"
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *           example: "user"
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *     
 *     CreateUserByAdminRequest:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "newuser@example.com"
 *         username:
 *           type: string
 *           example: "new_username"
 *         password:
 *           type: string
 *           format: password
 *           example: "SecurePass123!"
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *           example: "user"
 *     
 *     UpdateUserByAdminRequest:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *           example: "admin"
 *         isActive:
 *           type: boolean
 *           example: false
 *     
 *     AdminTaskResponse:
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
 *           example: "2024-12-31T23:59:59Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *     
 *     CreateTaskByAdminRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: "New task title"
 *         description:
 *           type: string
 *           example: "Task description"
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
 *           example: "2024-12-31T23:59:59Z"
 *     
 *     UpdateTaskByAdminRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Updated task title"
 *         description:
 *           type: string
 *           example: "Updated description"
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *           example: "completed"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           example: "high"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2024-12-31T23:59:59Z"
 */

/**
 * @swagger
 * components:
 *   responses:
 *     AdminUsersListResponse:
 *       description: List of all users
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/AdminUserResponse'
 *     
 *     AdminUserResponse:
 *       description: Single user response
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *               data:
 *                 $ref: '#/components/schemas/AdminUserResponse'
 *     
 *     AdminTaskResponse:
 *       description: Single task response
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *               data:
 *                 $ref: '#/components/schemas/AdminTaskResponse'
 *     
 *     AdminDeleteResponse:
 *       description: Delete success response
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 */