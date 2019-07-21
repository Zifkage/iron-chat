import { combineResolvers } from 'graphql-resolvers';
import { withFilter } from 'graphql-yoga';
import { UserInputError } from 'apollo-server';
import {
  isAuthenticated,
  isChannelMember,
  isOwner,
} from './authorization';

export default {
  Query: {
    discussionMessages: combineResolvers(
      isAuthenticated,
      isOwner('Discussion', 'discussionId'),
      async (_parent, { discussionId }, { models }) => {
        const discussion = await models.Discussion.findOne({
          where: {
            id: discussionId,
            deleted: false,
          },
        });

        if (!discussion) {
          throw new UserInputError(
            'This discussion does not exist.',
            {
              invalidArgs: ['discussionId'],
            },
          );
        }
        const messages = await models.Message.findAll({
          where: {
            discussionId,
          },
          order: [['createdAt', 'ASC']],
        });

        if (!messages) return [];

        return messages;
      },
    ),
  },
  Mutation: {
    createMessage: combineResolvers(
      isChannelMember,
      async (
        _parent,
        { channelId, text },
        { me, models, pubsub, EVENTS },
      ) => {
        if (!text) {
          throw new UserInputError('A message has to have a text.', {
            invalidArgs: ['text'],
          });
        }
        const channelMembers = await models.Member.findAll({
          where: { channelId },
        });
        const userIds = channelMembers.map(m => m.userId);
        let discussions = await models.Discussion.findAll({
          where: {
            channelId,
            userId: userIds,
          },
        });
        const myDiscussion = discussions.find(
          d => d.userId === me.id,
        );
        const createdAt = Date.now();
        let newMessages = discussions.map(d => ({
          text,
          userId: me.id,
          discussionId: d.id,
          createdAt,
        }));

        newMessages = await models.Message.bulkCreate(newMessages, {
          returning: true,
        });

        await models.Discussion.update(
          {
            deleted: false,
          },
          { where: { channelId } },
        );

        pubsub.publish(EVENTS.MESSAGE.CREATED, {
          messageCreated: {
            message: {
              text,
              userId: me.id,
              createdAt,
              channelId,
            },
          },
        });
        return newMessages.find(
          m => m.discussionId === myDiscussion.id,
        );
      },
    ),
  },
  Message: {
    user: async (message, _args, { loaders }) => {
      return await loaders.user.load(message.userId);
    },
    discussion: async (message, _args, { loaders }) => {
      return await loaders.discussion.load(message.discussionId);
    },
  },
  Subscription: {
    messageCreated: {
      subscribe: withFilter(
        (_parent, __args, { pubsub, EVENTS }) => {
          return pubsub.asyncIterator(EVENTS.MESSAGE.CREATED);
        },
        (payload, variables) => {
          return (
            payload.messageCreated.message.channelId.toString() ===
            variables.channelId
          );
        },
      ),
    },
  },
};
