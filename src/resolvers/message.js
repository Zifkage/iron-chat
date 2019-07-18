import { combineResolvers } from 'graphql-resolvers';
import { withFilter } from 'graphql-yoga';
import {
  isAuthenticated,
  isOwner,
  isChannelMember,
} from './authorization';

export default {
  Query: {
    channelMessages: combineResolvers(
      isChannelMember,
      async (_parent, { channelId }, { models }) => {
        const messages = await models.Message.findAll({
          where: {
            channelId,
          },
          order: [['createdAt', 'ASC']],
        });

        if (!messages) return [];

        return messages;
      },
    ),
    message: async (_parent, { id }, { models }) => {
      return await models.Message.findByPk(id);
    },
  },
  Mutation: {
    createMessage: combineResolvers(
      isChannelMember,
      async (
        _parent,
        { channelId, text },
        { me, models, pubsub, EVENTS },
      ) => {
        const message = await models.Message.create({
          text,
          userId: me.id,
          channelId,
        });

        pubsub.publish(EVENTS.MESSAGE.CREATED, {
          messageCreated: { message: message.toJSON() },
        });
        return message;
      },
    ),
    deleteMessage: combineResolvers(
      isAuthenticated,
      isOwner('Message'),
      async (_parent, { id }, { models }) => {
        return await models.Message.destroy({ where: { id } });
      },
    ),
    updateMessage: async (_parent, { id, text }, { models }) => {
      const message = await models.Message.findByPk(id);
      if (!message) {
        return false;
      }
      const result = await message.update({ text });

      return 'dataValues' in result;
    },
  },
  Message: {
    user: async (message, _args, { loaders }) => {
      return await loaders.user.load(message.userId);
    },
    channel: async (message, _arg, { loaders }) => {
      return await loaders.channel.load(message.channelId);
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
