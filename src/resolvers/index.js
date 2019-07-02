import { GraphQLDateTime } from 'graphql-iso-date';

import userResolvers from './user';
import messageResolvers from './message';
import channelResolvers from './channel';
import memberResolvers from './member';
import demandResolvers from './demand';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  userResolvers,
  messageResolvers,
  channelResolvers,
  memberResolvers,
  demandResolvers,
];
