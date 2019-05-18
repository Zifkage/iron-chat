import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);
import casual from 'casual';

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

    describe('deleteChannel(id: ID!)', function() {
      context('user is authenticated', function() {
        before(async function() {
          const response = await api.createChannel(
            {
              title: 'my channel',
              description: 'my channel description',
            },
            this.tokens.zifstarkToken,
          );

          const {
            data: {
              data: {
                createChannel: { id },
              },
            },
          } = response;

          this.channelId = id;
        });

        it('returns an error because only owner can delete a channel', async function() {
          const {
            data: { errors },
          } = await api.deleteChannel(
            { id: this.channelId },
            this.tokens.davidToken,
          );

          expect(errors[0].message).to.eql(
            'Not authenticated as owner.',
          );
        });

        it('returns true when the channel exist and the user is the owner', async function() {
          const {
            data: {
              data: { deleteChannel },
            },
          } = await api.deleteChannel(
            { id: this.channelId },
            this.tokens.zifstarkToken,
          );

          expect(deleteChannel).to.be.true;
        });
      });
    });
  });

  context('query', function() {
    describe('myChannels(): [Channel!]!', function() {
      context('user is authenticated', function() {
        before(async function() {
          this.expectedResult = {
            data: {
              myChannels: [
                {
                  title: casual.title,
                  description: 'my description',
                  user: {
                    username: 'ddavids',
                  },
                },
                {
                  title: casual.title,
                  description: 'my description',
                  user: {
                    username: 'ddavids',
                  },
                },
                {
                  title: casual.title,
                  description: 'my description',
                  user: {
                    username: 'ddavids',
                  },
                },
              ],
            },
          };
          const {
            data: { myChannels },
          } = this.expectedResult;
          for (let i = 0; i < myChannels.length; i++) {
            await api.createChannel(
              myChannels[i],
              this.tokens.davidToken,
            );
          }

          const response = await api.myChannels(
            this.tokens.davidToken,
          );
          this.channelsList = response.data;
        });

        it('return current user channels list if they exist', function() {
          expect(this.channelsList).to.containSubset(
            this.expectedResult,
          );
        });
      });
    });
  });
});
