import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);
import casual from 'casual';

import * as api from './api';
import models from '../models';

describe('member', function() {
  before(async function() {
    const {
      data: {
        data: {
          signIn: { token: zifstarkToken },
        },
      },
    } = await api.signIn({
      login: 'zifstark',
      password: 'zifstark',
    });
    const {
      data: {
        data: {
          signIn: { token: davidToken },
        },
      },
    } = await api.signIn({
      login: 'ddavids',
      password: 'ddavids',
    });

    const {
      data: {
        data: {
          signIn: { token: billToken },
        },
      },
    } = await api.signIn({
      login: 'bill',
      password: 'billbill',
    });

    this.tokens = {
      zifstarkToken,
      davidToken,
      billToken,
    };
  });

  describe('query', function() {
    describe('members(channelId: ID!): [Member!]!', function() {
      before(async function() {
        this.channel = await models.Channel.create({
          title: casual.title,
          description: casual.short_description,
          userId: 1,
        });
        await models.Member.create({
          userId: 1,
          channelId: this.channel.id,
        });
      });

      context('user is not authenticated', function() {
        before(async function() {
          const response = await api.members({
            channelId: this.channel.id,
          });
          this.errorMessage = response.data.errors[0].message;
        });

        it('returns an error because only authenticated user can query channel members list', function() {
          expect(this.errorMessage).to.eql(
            'Not authenticated as user.',
          );
        });
      });

      context('user is not a channel member', function() {
        before(async function() {
          const response = await api.members(
            {
              channelId: this.channel.id,
            },
            this.tokens.davidToken,
          );
          this.errorMessage = response.data.errors[0].message;
        });

        it('returns an error because only channel members can query channel members list', function() {
          expect(this.errorMessage).to.eql('Not a channel member.');
        });
      });

      context('user is a channel member', function() {
        before(async function() {
          await models.Member.create({
            userId: 2,
            channelId: this.channel.id,
          });
          const response = await api.members(
            {
              channelId: this.channel.id,
            },
            this.tokens.davidToken,
          );

          this.expectedResult = [
            {
              user: {
                username: 'zifstark',
              },
              channel: {
                id: this.channel.id.toString(),
              },
            },
            {
              user: {
                username: 'ddavids',
              },
              channel: {
                id: this.channel.id.toString(),
              },
            },
          ];
          this.members = response.data.data.members;
        });

        it('return the channel members list', function() {
          expect(this.members).to.eql(this.expectedResult);
        });
      });
    });
  });

  describe('mutation', function() {
    describe('addMembers(channelId: ID!, usersIds: [ID!]!) : [Member!]!', function() {
      before(async function() {
        this.channel = await models.Channel.create({
          title: casual.title,
          description: casual.short_description,
          userId: 1,
        });
        await models.Member.create({
          userId: 1,
          channelId: this.channel.id,
        });
      });
      context('user is not the channel owner', function() {
        before(async function() {
          const response = await api.addMembers(
            {
              channelId: this.channel.id,
              usersIds: ['2'],
            },
            this.tokens.davidToken,
          );

          this.errorMessage = response.data.errors[0].message;
        });

        it('returns an error because only channel owner can add members', function() {
          expect(this.errorMessage).to.eql(
            'Not authenticated as owner.',
          );
        });
      });
      context('user is the channel owner', function() {
        before(async function() {
          const response = await api.addMembers(
            {
              channelId: this.channel.id,
              usersIds: ['2'],
            },
            this.tokens.zifstarkToken,
          );

          this.expectedResult = [
            {
              user: {
                username: 'ddavids',
              },
              channel: {
                id: this.channel.id.toString(),
              },
            },
            {
              user: {
                username: 'zifstark',
              },
              channel: {
                id: this.channel.id.toString(),
              },
            },
          ];
          this.addMembers = response.data.data.addMembers;
        });

        it('return an array of newly added members', function() {
          expect(this.expectedResult).to.containSubset(
            this.addMembers,
          );
        });

        before(async function() {
          const response = await api.addMembers(
            {
              channelId: this.channel.id,
              usersIds: ['2'],
            },
            this.tokens.zifstarkToken,
          );

          this.errorMessage = response.data.errors[0].message;
        });

        it('return an error when a user is already a member', function() {
          expect(this.errorMessage).to.eql(
            'Cannot add a member to a channel more than once.',
          );
        });
      });
    });

    describe('removeMembers(channelId: ID!, usersIds: [ID!]!): [Member!]!', function() {
      before(async function() {
        this.channel = await models.Channel.create({
          userId: 1,
          title: casual.title,
          description: casual.short_description,
        });
        await models.Member.bulkCreate([
          {
            userId: 1,
            channelId: this.channel.id,
          },
          {
            userId: 2,
            channelId: this.channel.id,
          },
          {
            userId: 3,
            channelId: this.channel.id,
          },
        ]);
      });

      context('user is not the owner', function() {
        before(async function() {
          const response = await api.removeMembers(
            {
              channelId: this.channel.id,
              usersIds: ['1', '2'],
            },
            this.tokens.billToken,
          );
          this.errorMessage = response.data.errors[0].message;
        });

        it('returns an error because only channel owner can remove members', function() {
          expect(this.errorMessage).to.eql(
            'Not authenticated as owner.',
          );
        });
      });
    });
  });
});
