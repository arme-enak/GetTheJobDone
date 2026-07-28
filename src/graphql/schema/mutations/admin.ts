import { builder } from '../types/builder';
import { GraphQLContext } from '../../context';
import { GraphQLError } from 'graphql';
import { UserRef } from '../types/user';
import { TaskRef } from '../types/task';
import { CreateUserInput, UpdateUserInput, CreateTaskInput, UpdateTaskInput } from '../types/inputs';
import { hashPassword } from '../../../utils/hash';
import { registerSchema, userSchema, taskSchema } from '../../../utils/zod';
import { validate } from '../../validation';

builder.mutationField('adminCreateUser', (t) =>
  t.field({
    type: UserRef,
    description: 'Admin: Create a new user',
    args: {
      input: t.arg({ type: CreateUserInput, required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {

      if (!context.user || context.user.role !== 'admin') {
        throw new GraphQLError('Access denied. Admin only.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const { email, username, password, role } = validate(registerSchema, args.input);

      const existingEmail = await context.prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new GraphQLError('Email already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const existingUsername = await context.prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        throw new GraphQLError('Username already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const hashedPassword = await hashPassword(password);

      return context.prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role: role || 'user',
        },
      });
    },
  })
);

builder.mutationField('adminUpdateUser', (t) =>
  t.field({
    type: UserRef,
    description: 'Admin: Update a user',
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: UpdateUserInput, required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new GraphQLError('Access denied. Admin only.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const { id, input } = args;
      const validatedData = validate(userSchema, input);
      const data: any = {};

      if (validatedData.role) data.role = validatedData.role;
      if (validatedData.isActive !== undefined) data.isActive = validatedData.isActive;

      return context.prisma.user.update({
        where: { id },
        data,
      });
    },
  })
);

builder.mutationField('adminDeleteUser', (t) =>
  t.field({
    type: 'Boolean',
    description: 'Admin: Delete a user',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {
      
      if (!context.user || context.user.role !== 'admin') {
        throw new GraphQLError('Access denied. Admin only.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const userWhet = await context.prisma.user.findUnique({
        where: { id: context.user.userId },
      });
      
      if (!userWhet) {
        throw new GraphQLError('Whet?', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
       }

      const user = await context.prisma.user.findUnique({
        where: { id: args.id },
      });

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await context.prisma.user.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

builder.mutationField('adminCreateTask', (t) =>
  t.field({
    type: TaskRef,
    description: 'Admin: Create a new task',
    args: {
      input: t.arg({ type: CreateTaskInput, required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new GraphQLError('Access denied. Admin only.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const validatedData = validate(taskSchema, args.input);

      // const existingTask = await context.prisma.task.findFirst({
      //   where: { title },
      // });

      // if (existingTask) {
      //   throw new GraphQLError('Task with this title already exists', {
      //     extensions: { code: 'BAD_USER_INPUT' },
      //   });
      // }

      return context.prisma.task.create({
        data: {
          title: validatedData.title || "unNamede task",
          description: validatedData.description || null,
          status: validatedData.status || 'pending',
          priority: validatedData.priority || 'medium',
          dueDate: validatedData.dueDate || null,
        },
      });
    },
  })
);

builder.mutationField('adminUpdateTask', (t) =>
  t.field({
    type: TaskRef,
    description: 'Admin: Update a task',
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: UpdateTaskInput, required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new GraphQLError('Access denied. Admin only.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const { id, input } = args;
      const validatedData = validate(taskSchema, input);
      const data: any = {};

      if (validatedData.title) data.title = validatedData.title;
      if (validatedData.description !== undefined) data.description = validatedData.description;
      if (validatedData.status) data.status = validatedData.status;
      if (validatedData.priority) data.priority = validatedData.priority;
      if (validatedData.dueDate !== undefined) {
        data.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
      }


      return context.prisma.task.update({
        where: { id },
        data,
      });
    },
  })
);

builder.mutationField('adminDeleteTask', (t) =>
  t.field({
    type: 'Boolean',
    description: 'Admin: Delete a task',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new GraphQLError('Access denied. Admin only.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const task = await context.prisma.task.findUnique({
        where: { id: args.id },
      });

      if (!task) {
        throw new GraphQLError('Task not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await context.prisma.task.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);
// BUG: DELETED USER INVALID TOKEN
// Bug: UserName & e-mail aren't case sensitive