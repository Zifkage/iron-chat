import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated } from './authorization';

export default {
  Mutation: {
    sendFriendshipDemand: combineResolvers(
      isAuthenticated,
      async () => true,
    ),
  },
};
