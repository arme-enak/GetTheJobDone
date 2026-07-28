import { builder } from './builder';
import { UserRef } from './user';

export const AuthRef = builder.objectRef<{
  token: string;
  user: any;
}>('AuthPayload');

AuthRef.implement({
  description: 'Authentication payload with token and user data',
  fields: (t) => ({
    token: t.exposeString('token', { nullable: false }),
    user: t.field({ 
      type: UserRef, 
      nullable: false, 
      resolve: (parent) => parent.user,
    }),
  }),
});