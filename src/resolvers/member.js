import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isOwner } from './authorization';
import { ForbiddenError } from 'apollo-server';

export default {
  Query: {
    members: combineResolvers(isAuthenticated, async () => {
      return [];
    }),
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
