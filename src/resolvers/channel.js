import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isOwner } from './authorization';

export default {
  Mutation: {
    createChannel: combineResolvers(
      isAuthenticated,
      async (_parent, args, { me, models }) => {
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
  Query: {
    myChannels: combineResolvers(
      isAuthenticated,
      async (_parent, _args, { me, models }) => {
        return models.Channel.findAll({ where: { userId: me.id } });
      },
    ),
  },
  Channel: {
    user: async (channel, _args, { loaders }) => {
      return await loaders.user.load(channel.userId);
    },
  },
};
