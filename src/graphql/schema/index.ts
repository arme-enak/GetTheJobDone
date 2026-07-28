import { builder } from './types/builder';
import './types';
import './queries';
import './mutations';

export const schema = builder.toSchema();