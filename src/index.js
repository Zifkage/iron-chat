import dotenv from 'dotenv';
dotenv.config();

import DataLoader from 'dataloader';
import http from 'http';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import express from 'express';
import pubsub, { EVENTS } from './subscription/index';
import {
  ApolloServer,
  AuthenticationError,
} from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';
import loaders from './loaders';

const app = express();

app.use(cors());

const getMe = async req => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      const user = await jwt.verify(token, process.env.SECRET);
      return user;
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
};
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');

    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        pubsub,
        EVENTS,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
          channel: new DataLoader(keys =>
            loaders.channel.batchChannels(keys, models),
          ),
        },
      };
    }

    if (req) {
      const me = await getMe(req);

      return {
        models,
        me,
        pubsub,
        EVENTS,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
          channel: new DataLoader(keys =>
            loaders.channel.batchChannels(keys, models),
          ),
        },
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const isTest = !!process.env.TEST_DATABASE;

sequelize.sync({ force: isTest }).then(async () => {
  if (isTest) {
    createUsers();
  }

  const listener = httpServer.listen(
    { port: process.env.SERVER_PORT || 8080 },
    () => {
      console.log(
        `Apollo Server on http://localhost:${
          listener.address().port
        }/graphql`,
      );
    },
  );
});

const createUsers = async () => {
  await models.User.create({
    username: 'zifstark',
    email: 'zif@gmail.com',
    password: 'zifstark',
  });
  await models.User.create({
    username: 'ddavids',
    password: 'ddavids',
    email: 'hello@david.com',
  });
  await models.User.create({
    username: 'bill',
    password: 'billbill',
    email: 'bill@gml.com',
  });
};
