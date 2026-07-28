import { builder } from './builder';
import { User } from '@prisma/client';
import { role } from './enums';

export const UserRef = builder.objectRef<User>('userType');

UserRef.implement({
  description: 'User object type',
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    email: t.exposeString('email', { nullable: false }),
    username: t.exposeString('username', { nullable: false }),
    role: t.expose('role', { type: role, nullable: false }),
    isActive: t.exposeBoolean('isActive', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'Date', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'Date', nullable: false }),
  }),
});