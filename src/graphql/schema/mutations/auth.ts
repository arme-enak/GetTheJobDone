import { builder } from '../types/builder';
import { GraphQLContext } from '../../context';
import { GraphQLError } from 'graphql';
import { hashPassword, comparePassword } from '../../../utils/hash';
import { generateToken } from '../../../utils/jwt';
import { RegisterInput, LoginInput } from '../types/inputs';
import { AuthRef } from '../types/auth';
import { registerSchema, loginSchema } from '../../../utils/zod';
import { validate } from '../../validation';


builder.mutationField('register', (t) =>
  t.field({
    type: AuthRef,
    description: 'Register a new user',
    args: {
      input: t.arg({ type: RegisterInput, required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {
      const { email, username, password } = validate(registerSchema, args.input);

      const existingUser = await context.prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        throw new GraphQLError('User with this email or username already exists', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const hashedPassword = await hashPassword(password);

      const user = await context.prisma.user.create({
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

      return {
        token,
        user,
      };
    },
  })
);

builder.mutationField('login', (t) =>
  t.field({
    type: AuthRef,
    description: 'Login a user',
    args: {
      input: t.arg({ type: LoginInput, required: true }),
    },
    resolve: async (_parent, args, context: GraphQLContext) => {
      const { identifier, password } = validate(loginSchema, args.input);

       const user = await context.prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { username: identifier }
          ]
        }
      });

      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user,
      };
    },
  })
);