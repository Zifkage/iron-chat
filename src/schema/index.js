import { gql } from 'apollo-server-express';

import userSchema from './user';
import messageSchema from './message';
import channelSchema from './channel';
import memberSchema from './member';
import demandSchema from './demand';

const linkSchema = gql`
  scalar Date

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

export default [
  linkSchema,
  userSchema,
  messageSchema,
  channelSchema,
  memberSchema,
  demandSchema,
];
