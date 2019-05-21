import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);
import casual from 'casual';

import * as api from './api';

describe('channel', function() {
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

          expect(result.data).to.containSubset(expectedResult);
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

    describe('updateChannel(id: ID!, title: String, description: String): Boolean!', function() {
      before(async function() {
        const {
          data: {
            data: {
              createChannel: { id },
            },
          },
        } = await api.createChannel(
          {
            title: casual.title,
            description: casual.short_description,
          },
          this.tokens.zifstarkToken,
        );

        this.channelId = id;
      });
      context('user is not the channel owner', function() {
        before(async function() {
          const response = await api.updateChannel(
            {
              id: this.channelId,
              title: casual.title,
              description: casual.short_description,
            },
            this.tokens.davidToken,
          );

          this.errorMessage = response.data.errors[0].message;
        });

        it('returns an error because only channel owner can update a channel', function() {
          expect(this.errorMessage).to.eql(
            'Not authenticated as owner.',
          );
        });
      });

      context('user is the channel owner', function() {
        before(async function() {
          const response = await api.updateChannel(
            {
              id: this.channelId,
              title: casual.title,
              description: casual.short_description,
            },
            this.tokens.zifstarkToken,
          );

          this.updateChannel = response.data.data.updateChannel;
        });

        it('returns true', function() {
          expect(this.updateChannel).to.be.true;
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

      context('user is not authenticated', function() {
        before(async function() {
          this.response = await api.myChannels();
        });
        it('returns an error because only authenticated user can query user channels list', function() {
          expect(this.response.data.errors[0].message).to.eql(
            'Not authenticated as user.',
          );
        });
      });
    });
  });
});
