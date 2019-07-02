import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);
import casual from 'casual';

import * as api from './api';
import models from '../../models';

describe('channel', function() {
  before(async function() {
    await api.sampleOfAuthTokens(this);
  });

  context('mutation', function() {
    describe('createChannel(title: String!, description: String!): Channel!', function() {
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
        before(async function() {
          this.expectedResult = {
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

          this.result = await api.createChannel(
            {
              title: 'classmates',
              description: 'a channel for my classmate and i',
            },
            this.tokens.zifstarkToken,
          );
        });

        it('returns the newly created channel when valid data is given', async function() {
          expect(this.result.data).to.containSubset(
            this.expectedResult,
          );
        });

        it('should automatically add the channel owner as member', function() {
          const {
            data: {
              createChannel: { members },
            },
          } = this.result.data;
          expect(members).to.deep.contain({
            user: { username: 'zifstark' },
          });
        });
      });
    });

    describe('deleteChannel(id: ID!): Boolean!', function() {
      context('user is authenticated', function() {
        before(async function() {
          this.channel = await models.Channel.create({
            title: 'my channel',
            description: 'my channel description',
            userId: 1,
          });
        });

        describe('user is not the channel owner', function() {
          before(async function() {
            const {
              data: { errors },
            } = await api.deleteChannel(
              { id: this.channel.id },
              this.tokens.davidToken,
            );

            this.errorMessage = errors[0].message;
          });

          it('returns an error because only owner can delete a channel', async function() {
            expect(this.errorMessage).to.eql(
              'Not authenticated as owner.',
            );
          });
        });

        describe('user is the channel owner', function() {
          before(async function() {
            const {
              data: {
                data: { deleteChannel },
              },
            } = await api.deleteChannel(
              { id: this.channel.id },
              this.tokens.zifstarkToken,
            );
            this.channel = await models.Channel.findOne({
              where: { id: this.channel.id },
            });
            this.deleteChannel = deleteChannel;
          });

          it('returns true', async function() {
            expect(this.deleteChannel).to.be.true;
          });

          it('should delete the channel', function() {
            expect(this.channel).to.be.null;
          });
        });
      });
    });

    describe('updateChannel(id: ID!, title: String, description: String): Boolean!', function() {
      before(async function() {
        const { id } = await models.Channel.create({
          title: casual.title,
          description: casual.short_description,
          userId: 1,
        });

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
    describe('channels(userId: String!): [Channel!]!', function() {
      context('user is not authenticated', function() {
        before(async function() {
          const response = await api.channels({ userId: '1' });

          this.errorMessage = response.data.errors[0].message;
        });

        it('returns an error because only authenticated user query channel list', function() {
          expect(this.errorMessage).to.eql(
            'Not authenticated as user.',
          );
        });
      });

      context('user is authenticated', function() {
        before(async function() {
          await models.Channel.destroy({ where: { userId: 1 } });
          const channelsSample = [
            {
              title: casual.title,
              description: casual.short_description,
              userId: 1,
            },
            {
              title: casual.title,
              description: casual.short_description,
              userId: 1,
            },
            {
              title: casual.title,
              description: casual.short_description,
              userId: 2,
            },
            {
              title: casual.title,
              description: casual.short_description,
              userId: 2,
            },
          ];

          this.expectedResult = [];

          for (let i = 0; i < channelsSample.length; i++) {
            const channel = await models.Channel.create(
              channelsSample[i],
            );

            this.expectedResult.push({
              id: channel.id.toString(),
              title: channelsSample[i].title,
              description: channelsSample[i].description,
              user: {
                id: channelsSample[i].userId.toString(),
              },
            });

            if (channelsSample[i].userId === 1) {
              await models.Member.create({
                userId: 1,
                channelId: channel.id,
              });
              continue;
            }
            await models.Member.bulkCreate([
              {
                userId: 1,
                channelId: channel.id,
              },
              {
                userId: 2,
                channelId: channel.id,
              },
            ]);
          }

          const {
            data: {
              data: { channels },
            },
          } = await api.channels(
            { userId: '1' },
            this.tokens.zifstarkToken,
          );
          this.channels = channels;
        });

        it('return channel list when they exist', function() {
          expect(this.channels).to.deep.equal(this.expectedResult);
        });
      });
    });

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
            await models.Channel.create(
              {
                title: myChannels[i].title,
                description: myChannels[i].description,
                userId: 2,
              },
              this.tokens.davidToken,
            );
          }

          const response = await api.myChannels(
            this.tokens.davidToken,
          );
          this.channelsList = response.data;
        });

        it('return current user channels list', function() {
          expect(this.channelsList).to.containSubset(
            this.expectedResult,
          );
        });
      });

      context('user is not authenticated', function() {
        before(async function() {
          const {
            data: { errors },
          } = await api.myChannels();
          this.errorMessage = errors[0].message;
        });
        it('returns an error because only authenticated user can query user channels list', function() {
          expect(this.errorMessage).to.eql(
            'Not authenticated as user.',
          );
        });
      });
    });
  });
});
