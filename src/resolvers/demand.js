import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated } from './authorization';
import {
  UserInputError,
  ForbiddenError,
  ApolloError,
} from 'apollo-server';

export default {
  Query: {
    friendshipDemands: combineResolvers(
      isAuthenticated,
      async (_parent, { filter }, { me, models }) => {
        const demands = await models.Demand.findAll({
          where: {
            [filter == 'sent' ? 'from' : 'to']: me.id,
            accepted: false,
          },
        });
        if (!demands) {
          return [];
        }
        return demands;
      },
    ),
  },
  Mutation: {
    sendFriendshipDemand: combineResolvers(
      isAuthenticated,
      async (_parent, { userId }, { models, me }) => {
        const receiver = await models.User.findOne({
          where: { id: userId },
        });
        if (!receiver) {
          throw new UserInputError('The receiver does not exist.', {
            invalidArgs: ['userId'],
          });
        }
        await models.Demand.create({
          from: me.id,
          to: userId,
        });
        return true;
      },
    ),
    acceptFriendshipDemand: combineResolvers(
      isAuthenticated,
      async (_parent, { demandId }, { models, me }) => {
        const demand = await models.Demand.findOne({
          where: { id: demandId },
        });
        if (!demand) {
          throw new UserInputError('The demand does not exist.', {
            invalidArgs: ['demandId'],
          });
        }
        if (demand.to !== me.id) {
          throw new ForbiddenError('Not authenticated as owner.');
        }
        const result = await models.Demand.update(
          { accepted: true },
          {
            where: {
              id: demandId,
            },
          },
        );
        if (result[0] !== 1) {
          throw new ApolloError('Internal Server Error.');
        }
        // The demand is accepted
        // Makes the sender and the receiver friend
        try {
          await models.Friendship.bulkCreate([
            {
              userId: demand.from,
              friendId: demand.to,
            },
            {
              userId: demand.to,
              friendId: demand.from,
            },
          ]);
        } catch (e) {
          console.error(e);
        }
        return true;
      },
    ),
  },
  Demand: {
    from: async (demand, _args, { models }) => {
      return await models.User.findByPk(demand.from);
    },
    to: async (demand, _args, { models }) => {
      return await models.User.findByPk(demand.to);
    },
  },
};
