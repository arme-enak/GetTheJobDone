import { builder } from '../types/builder';
import { GraphQLContext } from '../../context';
import { TaskRef } from '../types/task';
import { GraphQLError } from 'graphql';

builder.queryField('myTasks', (t) =>
  t.field({
    type: [TaskRef],
    nullable: false,
    description: 'Get all tasks assigned to current user',
    resolve: async (_parent, _args, context: GraphQLContext) => {

      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }
      
      const userTasks = await context.prisma.userTask.findMany({
        where: { userId: context.user.userId },
        include: { task: true },
      });
      
      return userTasks.map(ut => ut.task);
    },
  })
);