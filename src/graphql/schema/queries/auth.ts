import { builder } from '../types/builder';
import { GraphQLContext } from '../../context';
import { UserRef } from '../types/user';
import { GraphQLError } from 'graphql';

builder.queryField('me', (t) =>
  t.field({
    type: UserRef,
    nullable: true,
    description: 'Get current authenticated user',
    resolve: async (_parent, _args, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }
      return context.prisma.user.findUnique({
        where: { id: context.user.userId },
      });
    },
  })
);