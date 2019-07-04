import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated } from './authorization';
import { UserInputError } from 'apollo-server';

export default {
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
  },
};
