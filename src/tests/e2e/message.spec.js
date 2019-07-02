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
              channel: {
                id: this.channel.id.toString(),
              },
              text: 'hello world',
            });
          });
        });
      });
    });
  });
});
