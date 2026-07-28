import { createYoga } from 'graphql-yoga';
import { schema } from './schema';
import { createContext } from './context';

export const yoga = createYoga({
  schema,
  graphiql: true,
  // cors: {
  //   origin: ['http://localhost:3000'],
  //   credentials: true,
  // },
  context: async ({ request }) => {   
    return createContext({ req: request as Request }) }

});