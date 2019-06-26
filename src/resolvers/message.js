import { combineResolvers } from 'graphql-resolvers';
import {
  isAuthenticated,
  isOwner,
  isChannelMember,
} from './authorization';
import { ForbiddenError } from 'apollo-server';
import Sequelize from 'sequelize';

import pubsub, { EVENTS } from '../subscription';

const toCursorHash = string => Buffer.from(string).toString('base64');
const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    messages: async (
      _parent,
      { cursor, limit = 100 },
      { models },
    ) => {
      const cursorOptions = cursor
        ? {
            where: {
              createdAt: {
                [Sequelize.Op.lt]: fromCursorHash(cursor),
              },
            },
          }
        : {};
      const messages = await models.Message.findAll({
        order: [['createdAt', 'DESC']],
        limit: limit + 1,
        ...cursorOptions,
      });

      const hasNextPage = messages.length > limit;
      const edges = hasNextPage ? messages.slice(0, -1) : messages;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: toCursorHash(
            edges[edges.length - 1].createdAt.toString(),
          ),
        },
      };
    },
    message: async (_parent, { id }, { models }) => {
      return await models.Message.findByPk(id);
    },
  },
  Mutation: {
    createMessage: combineResolvers(
      isChannelMember,
      async (_parent, { channelId, text }, { me, models }) => {
        const message = await models.Message.create({
          text,
          userId: me.id,
        });

        pubsub.publish(EVENTS.MESSAGE.CREATED, {
          messageCreated: { message },
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
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
    },
  },
};
