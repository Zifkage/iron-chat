import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isOwner } from './authorization';

export default {
  Mutation: {
    addMembers: combineResolvers(
      isAuthenticated,
      isOwner('Channel', 'channelId'),
      async () => {
        return true;
      },
    ),
  },
};
