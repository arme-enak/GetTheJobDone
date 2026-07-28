import { builder } from './builder';
import { Task } from '@prisma/client';
import { taskStatus, priority } from './enums';


export const TaskRef = builder.objectRef<Task>('Task');

TaskRef.implement({
  description: 'Task object type',
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    description: t.exposeString('description', { nullable: true }),
    status: t.expose('status', { type: taskStatus, nullable: false }),
    priority: t.expose('priority', { type: priority, nullable: false }),
    dueDate: t.expose('dueDate', { type: 'Date', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'Date', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'Date', nullable: false }),
  }),
});