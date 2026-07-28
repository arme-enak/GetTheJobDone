import { builder } from '../types/builder';
import { GraphQLContext } from '../../context';
import { GraphQLError } from 'graphql';
import { UserRef } from '../types/user';
import { TaskRef } from '../types/task';
import { UpdateProfileInput } from '../types/inputs';
import { hashPassword } from '../../../utils/hash';
import { userSchema } from '../../../utils/zod';
import { validate } from '../../validation';

builder.mutationField('updateProfile', (t) =>
  t.field({
    type: UserRef,
    description: 'Update current user profile',
    args: {
      input: t.arg({ type: UpdateProfileInput, required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {

      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }
      
      const user = await context.prisma.user.findUnique({
        where: { id: context.user.userId },
      });

      if (!user) {
        throw new GraphQLError('Whet?', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      const validatedData = validate(userSchema, args.input);
      const data: any = {};

      if (validatedData.email) data.email = validatedData.email;
      if (validatedData.username) data.username = validatedData.username;
      if (args.input.password) {
        data.password = await hashPassword(args.input.password);
      }

      if (validatedData.email || validatedData.username) {
        const existingUser = await context.prisma.user.findFirst({
         where: {
            OR: [
              validatedData.email ? { email: validatedData.email } : {},
              validatedData.username ? { username: validatedData.username } : {},
           ],
            NOT: {
              id: context.user.userId,
            },
         },
        });

        if (existingUser) {
          throw new GraphQLError('Email or username already taken', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
        }
      }
      
      return context.prisma.user.update({
        where: { id: context.user.userId },
        data,
      });
    },
  })
);

builder.mutationField('deleteAccount', (t) =>
  t.field({
    type: 'Boolean',
    description: 'Delete current user account',
    resolve: async (_parent, _args, context: GraphQLContext) => {
        
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }

      const user = await context.prisma.user.findUnique({
        where: { id: context.user.userId },
      });

      if (!user) {
        throw new GraphQLError('User already deleted', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      await context.prisma.user.delete({
        where: { id: context.user.userId },
      });

      return true;
    },
  })
);

builder.mutationField('assignTaskToMe', (t) =>
  t.field({
    type: TaskRef,
    description: 'Assign a task to current user',
    args: {
      taskId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {
      
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }

      const user = await context.prisma.user.findUnique({
        where: { id: context.user.userId },
      });

      if (!user) {
        throw new GraphQLError('Whet?', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      const { taskId } = args;

      const task = await context.prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new GraphQLError('Task not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      const existingAssignment = await context.prisma.userTask.findUnique({
        where: {
          userId_taskId: {
            userId: context.user.userId,
            taskId: taskId,
          },
        },
      });

      if (existingAssignment) {
        throw new GraphQLError('Task already assigned to you', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      await context.prisma.userTask.create({
        data: {
          userId: context.user.userId,
          taskId: taskId,
        },
      });

      return task;
    },
  })
);