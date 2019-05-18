import jwt from 'jsonwebtoken';
import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, UserInputError } from 'apollo-server';

import { isAdmin } from './authorization';

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, roles } = user;
  return await jwt.sign({ id, email, username, roles }, secret, {
    expiresIn,
  });
};

export default {
  Query: {
    users: async (_parent, _args, { models }) => {
      return await models.User.findAll();
    },
    user: async (_parent, { id }, { models }) => {
      return await models.User.findByPk(id);
    },
    me: async (_parent, _args, { models, me }) => {
      if (!me) {
        return null;
      }
      return await models.User.findByPk(me.id);
    },
  },
  Mutation: {
    signUp: async (
      _parent,
      { username, email, password },
      { models, secret },
    ) => {
      const user = await models.User.create({
        username,
        email,
        password,
      });

      return { token: createToken(user, secret, '60m') };
    },
    signIn: async (
      _parent,
      { login, password },
      { models, secret },
    ) => {
      const user = await models.User.findByLogin(login);

      if (!user) {
        throw new UserInputError(
          'No user found with this login credentials.',
        );
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }
      return { token: createToken(user, secret, '60m') };
    },
    deleteUser: combineResolvers(
      isAdmin,
      async (_parent, { id }, { models }) => {
        return await models.User.destroy({
          where: { id },
        });
      },
    ),
  },
  User: {
    messages: async (user, _args, { models }) => {
      return await models.Message.findAll({
        where: {
          userId: user.id,
        },
      });
    },
  },
};
