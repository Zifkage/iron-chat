import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isOwner } from './authorization';

export default {
  Mutation: {
    createChannel: combineResolvers(
      isAuthenticated,
      async (_parent, args, { me, models }) => {
        return await models.Channel.create(
          {
            ...args,
            userId: me.id,
            members: [
              {
                userId: me.id,
              },
            ],
          },
          { include: [models.Member] },
        );
      },
    ),
    deleteChannel: combineResolvers(
      isAuthenticated,
      isOwner('Channel'),
      async (_parent, { id }, { models }) => {
        const count = await models.Channel.destroy({
          where: { id },
        });
        return count > 0;
      },
    ),
    updateChannel: combineResolvers(
      isAuthenticated,
      isOwner('Channel'),
      async (_parent, args, { models }) => {
        if (!('title' in args || 'description' in args)) {
          return false;
        }
        const result = await models.Channel.update(
          { ...args },
          { where: { id: args.id } },
        );
        return result[0] > 0;
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
    members: async (channel, _args, { models }) => {
      return await models.Member.findAll({
        where: { channelId: channel.id },
      });
    },
  },
};
