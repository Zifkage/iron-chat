import { combineResolvers } from 'graphql-resolvers';
import {
  isAuthenticated,
  isOwner,
  isChannelMember,
} from './authorization';
import { ForbiddenError } from 'apollo-server';

export default {
  Query: {
    members: combineResolvers(
      isChannelMember,
      async (_parent, { channelId }, { models }) => {
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
      async (_parent, { channelId, userIds }, { models }) => {
        const membersToAdd = [];
        const discussionsToCreate = [];
        const existingMembers = await models.Member.findAll({
          where: {
            channelId,
            userId: userIds,
          },
        });
        if (existingMembers.length > 0) {
          throw new ForbiddenError(
            'Cannot add a member to a channel more than once.',
          );
        }
        userIds.forEach(userId => {
          membersToAdd.push({
            channelId,
            userId,
          });
          discussionsToCreate.push({
            userId,
            channelId,
            deleted: false,
          });
        });

        await models.Member.bulkCreate(membersToAdd);
        await models.Discussion.bulkCreate(discussionsToCreate);
        const members = await models.Member.findAll({
          where: { channelId },
        });
        return members;
      },
    ),
    removeMembers: combineResolvers(
      isAuthenticated,
      isOwner('Channel', 'channelId'),
      async (_parent, { channelId, userIds }, { models }) => {
        await models.Member.destroy({
          where: { channelId, userId: userIds },
        });
        return await models.Member.findAll({ where: { channelId } });
      },
    ),
    quitChannel: combineResolvers(
      isAuthenticated,
      async (_parent, { channelId }, { models, me }) => {
        const count = await models.Member.destroy({
          where: { channelId, userId: me.id },
        });
        return count > 0;
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
