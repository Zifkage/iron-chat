import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isOwner } from './authorization';

export default {
  Mutation: {
    addMembers: combineResolvers(
      isAuthenticated,
      isOwner('Channel', 'channelId'),
      async (_parent, { channelId, usersIds }, { models }) => {
        const membersToAdd = [];
        usersIds.forEach(userId => {
          membersToAdd.push({
            channelId,
            userId,
          });
        });

        await models.Member.bulkCreate(membersToAdd);
        const members = await models.Member.findAll({
          where: { channelId },
        });
        return members;
      },
    ),
  },
  Member: {
    user: async (member, _args, { loaders }) => {
      return await loaders.user.load(member.userId);
    },
    channel: async (member, _args, { loaders }) => {
      return await loaders.channel.load(member.channelId);
    },
  },
};
