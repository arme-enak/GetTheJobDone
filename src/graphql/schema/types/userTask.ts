import { builder } from './builder';
import { UserTask } from '@prisma/client';

export const UserTaskRef = builder.objectRef<UserTask>('UserTask');

UserTaskRef.implement({
  description: 'UserTask junction type (many-to-many relation)',
  fields: (t) => ({
    userId: t.exposeString('userId', { nullable: false }),
    taskId: t.exposeString('taskId', { nullable: false }),
    assignedAt: t.expose('assignedAt', { type: 'Date', nullable: false }),
  }),
});