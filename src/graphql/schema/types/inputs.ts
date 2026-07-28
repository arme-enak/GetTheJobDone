import { builder } from './builder';
import { role, taskStatus, priority } from './enums';

// ============ Auth Inputs ============
export const RegisterInput = builder.inputType('RegisterInput', {
  description: 'Input for user registration',
  fields: (t) => ({
    email: t.string({ required: true }),
    username: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
});

export const LoginInput = builder.inputType('LoginInput', {
  description: 'Input for user login',
  fields: (t) => ({
    identifier: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
});

// ============ User Inputs ============
export const UpdateProfileInput = builder.inputType('UpdateProfileInput', {
  description: 'Update current user profile',
  fields: (t) => ({
    email: t.string({ required: false }),
    username: t.string({ required: false }),
    password: t.string({ required: false }),
  }),
});

// ============ Admin Inputs ============
export const CreateUserInput = builder.inputType('CreateUserInput', {
  description: 'Admin: Create new user',
  fields: (t) => ({
    email: t.string({ required: true }),
    username: t.string({ required: true }),
    password: t.string({ required: true }),
    role: t.field({ type: role, required: false }),
  }),
});

export const UpdateUserInput = builder.inputType('UpdateUserInput', {
  description: 'Admin: Update user',
  fields: (t) => ({
    // email: t.string({ required: false }),
    // username: t.string({ required: false }),
    // password: t.string({ required: false }),
    role: t.field({ type: role, required: false }),
    isActive: t.boolean({ required: false }),
  }),
});

export const CreateTaskInput = builder.inputType('CreateTaskInput', {
  description: 'Admin: Create new task',
  fields: (t) => ({
    title: t.string({ required: true }),
    description: t.string({ required: false }),
    status: t.field({ type: taskStatus, required: false }),
    priority: t.field({ type: priority, required: false }),
    dueDate: t.field({ type: 'Date', required: false }),
  }),
});

export const UpdateTaskInput = builder.inputType('UpdateTaskInput', {
  description: 'Admin: Update task',
  fields: (t) => ({
    title: t.string({ required: false }),
    description: t.string({ required: false }),
    status: t.field({ type: taskStatus, required: false }),
    priority: t.field({ type: priority, required: false }),
    dueDate: t.field({ type: 'Date', required: false }),
  }),
});