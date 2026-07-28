import { builder } from './builder';
import { Role, TaskStatus, Priority } from '@prisma/client';

export const role = builder.enumType(Role, {
  name: 'Role',
});

export const taskStatus = builder.enumType(TaskStatus, {
  name: 'TaskStatus',
});

export const priority = builder.enumType(Priority, {
  name: 'Priority',
});