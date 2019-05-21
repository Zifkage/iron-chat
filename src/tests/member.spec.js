import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);
import casual from 'casual';

import * as api from './api';

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
          createChannel: { id: zifstarkChlId },
        },
      },
    } = await api.createChannel(
      {
        title: casual.title,
        description: casual.short_description,
      },
      zifstarkToken,
    );

    const {
      data: {
        data: {
          createChannel: { id: davidChlId },
        },
      },
    } = await api.createChannel(
      {
        title: casual.title,
        description: casual.short_description,
      },
      davidToken,
    );

    this.tokens = {
      zifstarkToken,
      davidToken,
    };

    this.channels = {
      zifstarkChlId,
      davidChlId,
    };
  });
  describe('addMembers(channelId: ID!, usersIds: [ID!]!) : [Member!]!', function() {
    context('user is not the channel owner', function() {
      before(async function() {
        const response = await api.addMembers(
          {
            channelId: this.channels.zifstarkChlId,
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
            channelId: this.channels.zifstarkChlId,
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
              id: this.channels.zifstarkChlId,
            },
          },
        ];
        this.addMembers = response.data.data.addMembers;
      });

      it('return an array of newly added members', function() {
        expect(this.expectedResult).to.containSubset(this.addMembers);
      });
    });
  });
});
