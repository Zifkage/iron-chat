import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);
import casual from 'casual';

import * as api from './api';
import models from '../../models';

describe('message', function() {
  before(async function() {
    await api.sampleOfAuthTokens(this);
  });

  describe('mutation', function() {
    describe('createMessage(channelId: ID!, text: String!): Message!', function() {
      before(async function() {
        this.channel = await models.Channel.create({
          userId: 1,
          title: casual.title,
          description: casual.short_description,
        });

        this.discussion = await models.Discussion.create({
          userId: 1,
          channelId: this.channel.id,
          deleted: false,
        });

        await models.Member.create({
          userId: 1,
          channelId: this.channel.id,
        });
      });

      context('user is not authenticated', function() {
        before(async function() {
          const response = await api.createMessage({
            channelId: this.channel.id,
            text: 'hello world!',
          });
          this.errorMessage = response.data.errors[0].message;
        });

        it('should returns an error', function() {
          expect(this.errorMessage).to.eql(
            'Not authenticated as user.',
          );
        });
      });

      context('user is authenticated', function() {
        describe('user is not a channel member', function() {
          before(async function() {
            const response = await api.createMessage(
              {
                channelId: this.channel.id,
                text: 'hello world',
              },
              this.tokens.davidToken,
            );

            this.errorMessage = response.data.errors[0].message;
          });

          it('should returns an error', function() {
            expect(this.errorMessage).to.eql('Not a channel member.');
          });
        });

        describe('user is a channel member', function() {
          describe('message text is empty', function() {
            before(async function() {
              const response = await api.createMessage(
                {
                  channelId: this.channel.id,
                  text: '',
                },
                this.tokens.zifstarkToken,
              );
              this.errorMessage = response.data.errors[0].message;
            });

            it('should returns the newly created message', function() {
              expect(this.errorMessage).to.eql(
                'A message has to have a text.',
              );
            });
          });

          describe('message is valid', function() {
            before(async function() {
              const response = await api.createMessage(
                {
                  channelId: this.channel.id,
                  text: 'hello world',
                },
                this.tokens.zifstarkToken,
              );

              this.createMessage = response.data.data.createMessage;
            });

            it('should returns the newly created message', function() {
              expect(this.createMessage).to.eql({
                user: {
                  id: '1',
                },
                text: 'hello world',
              });
            });
          });
        });
      });
    });
  });

  describe('query', function() {
    describe('discussionMessages(discussionId: ID!): [Message!]!', function() {
      context('user is authenticated', function() {
        describe('the discussion does not exist', function() {
          before(async function() {
            const response = await api.discussionMessages(
              { discussionId: 200 },
              this.tokens.zifstarkToken,
            );
            this.errorMessage = response.data.errors[0].message;
          });

          it('should returns an error', function() {
            expect(this.errorMessage).to.eql(
              'This discussion does not exist.',
            );
          });
        });

        describe('the discussion exist', function() {
          before(async function() {
            this.channel = await models.Channel.create({
              title: casual.title,
              description: casual.short_description,
              userId: 1,
            });
            this.discussion = await models.Discussion.create({
              userId: 1,
              channelId: this.channel.id,
              deleted: false,
            });
            await models.Member.create({
              userId: 1,
              channelId: this.channel.id,
            });
          });

          describe('there is no message', function() {
            before(async function() {
              const response = await api.discussionMessages(
                { discussionId: this.discussion.id },
                this.tokens.zifstarkToken,
              );
              this.discussionMessages =
                response.data.data.discussionMessages;
            });

            it('returns an empty', function() {
              expect(this.discussionMessages).to.be.empty;
            });
          });

          describe('there are 2 messages', function() {
            before(async function() {
              await models.Message.bulkCreate([
                {
                  discussionId: this.discussion.id,
                  userId: 1,
                  text: 'hello 1',
                },
                {
                  discussionId: this.discussion.id,
                  userId: 2,
                  text: 'hello 2',
                },
              ]);

              const response = await api.discussionMessages(
                { discussionId: this.discussion.id },
                this.tokens.zifstarkToken,
              );

              this.discussionMessages =
                response.data.data.discussionMessages;
            });

            it('returns the messages', function() {
              expect(this.discussionMessages).to.deep.equal([
                {
                  user: { username: 'zifstark' },
                  text: 'hello 1',
                },
                {
                  user: { username: 'ddavids' },
                  text: 'hello 2',
                },
              ]);
            });
          });
        });
      });
    });
  });
});
