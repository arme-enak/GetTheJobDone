import { builder } from '../types/builder';
import { GraphQLContext } from '../../context';
import { TaskRef } from '../types/task';
import { GraphQLError } from 'graphql';

builder.queryField('tasks', (t) =>
  t.field({
    type: [TaskRef],
    nullable: false,
    description: 'Get all tasks',
    resolve: async (_parent, _args, context: GraphQLContext) => {
      return context.prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
      });
    },
  })
);

builder.queryField('task', (t) =>
  t.field({
    type: TaskRef,
    nullable: true,
    description: 'Get a task by ID',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {
      const task = await context.prisma.task.findUnique({
        where: { id: args.id },
      });
      if (!task) {
        throw new GraphQLError('Task not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }
      return task;
    },
  })
);