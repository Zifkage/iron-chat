import { expect } from 'chai';

import * as api from './api';

describe('message channels', function() {
  after(async function() {
    await api.eraseTables();
  });

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
    this.tokens = {
      zifstarkToken,
      davidToken,
    };
  });

  context('mutation', function() {
    describe('createChannel', function() {
      context('user is not authenticated', function() {
        it('returns an errors because only authenticated user can create a channel', async function() {
          const {
            data: { errors },
          } = await api.createChannel({
            title: 'classmates',
            description: 'a channel for my classmate and i',
          });

          expect(errors[0].message).to.eql(
            'Not authenticated as user.',
          );
        });
      });
      context('user is authenticated', function() {
        it('returns the newly created channel when valid data is given', async function() {
          const expectedResult = {
            data: {
              createChannel: {
                title: 'classmates',
                description: 'a channel for my classmate and i',
                user: {
                  username: 'zifstark',
                },
              },
            },
          };

          const result = await api.createChannel(
            {
              title: 'classmates',
              description: 'a channel for my classmate and i',
            },
            this.tokens.zifstarkToken,
          );
          delete result.data.data.createChannel.id;
          expect(result.data).to.eql(expectedResult);
        });
      });
    });

    describe('deleteChannel(id: String!)', function() {
      context('user is authenticated', function() {
        before(async function() {
          this.response = await api.createChannel(
            {
              title: 'my channel',
              description: 'my channel description',
            },
            this.tokens.zifstarkToken,
          );
        });

        it('return an error because only owner can delete a channel', async function() {
          const {
            data: {
              data: {
                createChannel: { id },
              },
            },
          } = this.response;

          const {
            data: { errors },
          } = await api.deleteChannel({ id }, this.tokens.davidToken);

          expect(errors[0].message).to.eql(
            'Not authenticated as owner.',
          );
        });
      });
    });
  });
});
