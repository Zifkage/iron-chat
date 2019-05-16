import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from './authorization';

export default {
  Mutation: {
    createChannel: combineResolvers(isAuthenticated, async () => {
      return '';
    }),
  },
  Channel: {
    user: async (channel, _, { loaders }) => {
      return await loaders.user.load(channel.userId);
    },
  },
};
