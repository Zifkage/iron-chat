import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated } from './authorization';
import { UserInputError } from 'apollo-server';

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
      async (_parent, { demandId }, { models }) => {
        const demand = await models.Demand.findByPk(demandId);
        if (!demand) {
          throw new UserInputError('The demand does not exist.', {
            invalidArgs: ['demandId'],
          });
        }
        return null;
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
