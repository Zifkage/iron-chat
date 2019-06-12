import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isOwner } from './authorization';
import { ForbiddenError } from 'apollo-server';

export default {
  Query: {
    members: combineResolvers(
      isAuthenticated,
      async (_parent, { channelId }, { me, models }) => {
        const member = await models.Member.findOne({
          where: { userId: me.id, channelId },
        });
        if (!member) {
          throw new ForbiddenError('Not a channel member.');
        }
        const members = await models.Member.findAll({
          where: { channelId },
        });
        return members;
      },
    ),
  },
  Mutation: {
    addMembers: combineResolvers(
      isAuthenticated,
      isOwner('Channel', 'channelId'),
      async (_parent, { channelId, usersIds }, { models }) => {
        const membersToAdd = [];
        const existingMembers = await models.Member.findAll({
          where: {
            channelId,
            userId: usersIds,
          },
        });
        if (existingMembers.length > 0) {
          throw new ForbiddenError(
            'Cannot add a member to a channel more than once.',
          );
        }
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
    removeMembers: combineResolvers(
      isAuthenticated,
      isOwner('Channel', 'channelId'),
      async (_parent, { channelId, usersIds }, { models }) => {
        await models.Member.destroy({
          where: { channelId, userId: usersIds },
        });
        return await models.Member.findAll({ where: { channelId } });
      },
    ),
    quitChannel: combineResolvers(isAuthenticated, async () => null),
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
