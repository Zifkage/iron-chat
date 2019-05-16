import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from './authorization';

export default {
  Mutation: {
    createChannel: combineResolvers(
      isAuthenticated,
      async (_, args, { me, models }) => {
        return models.Channel.create({
          ...args,
          userId: me.id,
        });
      },
    ),
  },
  Channel: {
    user: async (channel, _, { loaders }) => {
      return await loaders.user.load(channel.userId);
    },
  },
};
