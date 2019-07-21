import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isOwner } from './authorization';

export default {
  Query: {
    discussions: combineResolvers(
      isAuthenticated,
      async (_parent, _args, { models, me }) => {
        const discussions = await models.Discussion.findAll({
          where: { userId: me.id, deleted: false },
        });
        return discussions;
      },
    ),
  },
  Mutation: {
    deleteDiscussion: combineResolvers(
      isAuthenticated,
      isOwner('Discussion'),
      async (_parent, { id }, { models }) => {
        const result = await models.Discussion.update(
          { deleted: true },
          {
            where: { id },
          },
        );
        await models.Message.destroy({ where: { discussionId: id } });
        return result[0] > 0;
      },
    ),
  },
  Discussion: {
    user: async (discussion, _args, { loaders }) => {
      return await loaders.user.load(discussion.userId);
    },
    channel: async (discussion, _args, { loaders }) => {
      return await loaders.channel.load(discussion.channelId);
    },
  },
};
