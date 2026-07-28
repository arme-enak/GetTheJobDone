import { builder } from '../types/builder';
import { GraphQLContext } from '../../context';
import { UserRef } from '../types/user';
import { GraphQLError } from 'graphql';

builder.queryField('adminUsers', (t) =>
  t.field({
    type: [UserRef],
    nullable: false,
    description: 'Admin: Get all users',
    resolve: async (_parent, _args, context: GraphQLContext) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new GraphQLError('Access denied. Admin only.', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }
      return context.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
    },
  })
);

builder.queryField('adminUser', (t) =>
  t.field({
    type: UserRef,
    nullable: true,
    description: 'Admin: Get a user by ID',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {
     if (!context.user || context.user.role !== 'admin') {
        throw new GraphQLError('Access denied. Admin only.', {
          extensions: {
           code: 'FORBIDDEN',
          },
        });
      }
      const user = context.prisma.user.findUnique({
        where: { id: args.id },
      });

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }
      
      return user;
    },
  })
);