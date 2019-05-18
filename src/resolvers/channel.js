import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isOwner } from './authorization';

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
    deleteChannel: combineResolvers(
      isAuthenticated,
      isOwner('Channel'),
      async (_parent, { id }, { models }) => {
        return await models.Channel.destroy({ where: { id } });
      },
    ),
  },
  Channel: {
    user: async (channel, _, { loaders }) => {
      return await loaders.user.load(channel.userId);
    },
  },
};
