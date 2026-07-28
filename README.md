# GetTheJobDone

A Task Management API built with TypeScript, Express.js, Prisma, and GraphQL.

## Features

- 🔐 JWT Authentication (Register/Login)
- 🔒 Role-based access control (Admin, Moderator, User)
- ✅ Input validation with Zod
- 📝 CRUD operations for admins, users & tasks
- 👥 User management
- 🗄️ PostgreSQL with Prisma ORM
- 📊 Task status and priority tracking
- 🚀 GraphQL API Version (Bonus)

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Validation:** Zod

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v9.6 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Armenak-2004/GetTheJobDone.git
cd GetTheJobDone
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory: (based on sample)

```env
PORT=XXXX
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/your-database?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
BCRYPT_SALT_ROUNDS=10
```

### 4. Run database migrations

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma migrate dev
```

### 5. Start development server

```bash
npm run dev
```

The server will run at `http://localhost:XXXX`

## API Endpoints

### REST API

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

#### User Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get current user profile |
| PATCH | `/api/users/profile` | Update current user profile |
| DELETE | `/api/users/profile` | Delete current user account |
| GET | `/api/users/tasks` | Get all tasks assigned to current user |
| POST | `/api/users/tasks/:id/assign` | Assign a task to current user |

#### Task Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get task by ID |

#### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| POST | `/api/admin/users` | Create new user |
| PATCH | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/admin/tasks` | Create new task |
| PATCH | `/api/admin/tasks/:id` | Update task |
| DELETE | `/api/admin/tasks/:id` | Delete task |

### GraphQL API

| Endpoint | Description |
|----------|-------------|
| `/graphql` | GraphiQL playground |

> **Authentication:** Include `Authorization: Bearer <token>` header for protected queries/mutations.


## Project Structure

```plaintext
src/
├── config/          # Configuration files
├── graphql/         # GraphQL layer
│   ├── server.ts    # Yoga server config
│   ├── context.ts   # GraphQL context (Prisma + Auth)
│   └── schema/      # Resolvers 
│       ├── types/
│       ├── queries/
│       └── mutations/
├── modules/         # Feature modules 
│   ├── admin/       # Admin module
│   ├── auth/        # Authentication module
│   ├── user/        # User module
│   └── task/        # Task module
├── middleware/      # Express middleware
├── utils/           # Utility functions
├── types/           # TypeScript types/interfaces
├── app.ts           # Express app setup
└── server.ts        # Express server setup
```
## Database Schema

### User
- id
- email
- username
- password
- role
- isActive
- createdAt
- updatedAt
- userTasks[]

### Task
- id
- title
- description
- status
- priority
- dueDate
- createdAt
- updatedAt
- userTasks[]

### UserTask (Many-to-Many)
- userId
- taskId
- assignedAt

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Author

Armenak-2004
