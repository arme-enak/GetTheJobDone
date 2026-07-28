import SchemaBuilder from '@pothos/core';
import { GraphQLContext } from '../../context';

export const builder = new SchemaBuilder<{
  plugins: [],
  Context: GraphQLContext;
  Scalars: {
    Date: { Input: Date; Output: Date };
  };
}>({});

builder.scalarType('Date', {
  serialize: (value) => value instanceof Date ? value.toISOString() : String(value),
  parseValue: (value) => typeof value === 'string' ? new Date(value) : new Date(String(value)),
});
builder.queryType({});
builder.mutationType({});