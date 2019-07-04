import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);

import * as api from './api';
import models from '../../models';

describe('demand', function() {
  before(async function() {
    await api.sampleOfAuthTokens(this);
  });

  describe('mutation', function() {
    describe('sendFriendshipDemand(userId: ID!): Boolean!', function() {
      describe('user is not authenticated', function() {
        before(async function() {
          const response = await api.sendFriendshipDemand({
            userId: 2,
          });
          this.errorMessage = response.data.errors[0].message;
        });

        it('should returns an error', function() {
          expect(this.errorMessage).to.eql(
            'Not authenticated as user.',
          );
        });
      });

      describe('user is authenticated', function() {
        describe('the receiver does not exist', function() {
          before(async function() {
            const response = await api.sendFriendshipDemand(
              {
                userId: 200,
              },
              this.tokens.zifstarkToken,
            );

            this.errorMessage = response.data.errors[0].message;
          });

          it('should create a demand database', function() {
            expect(this.errorMessage).to.eql(
              'The receiver does not exist.',
            );
          });
        });
        describe('the receiver exist', function() {
          before(async function() {
            const response = await api.sendFriendshipDemand(
              {
                userId: 2,
              },
              this.tokens.zifstarkToken,
            );
            this.demand = await models.Demand.findOne({
              where: {
                from: 1,
                to: 2,
              },
            });

            this.sendFriendshipDemand =
              response.data.data.sendFriendshipDemand;
          });

          it('should create a demand', function() {
            expect(this.demand).to.containSubset({
              from: 1,
              to: 2,
              accepted: false,
            });
          });

          it('return true', function() {
            expect(this.sendFriendshipDemand).to.be.true;
          });
        });
      });
    });
  });

  describe('query', function() {
    describe('friendshipDemandsReceived(): [Demand!]!', function() {
      context('user is authenticated', function() {
        describe('user did not receive any demand', function() {
          before(async function() {
            const response = await api.friendshipDemandsReceived(
              this.tokens.zifstarkToken,
            );
            this.friendshipDemandsReceived =
              response.data.data.friendshipDemandsReceived;
          });

          it('should returns an empty array', function() {
            expect(this.friendshipDemandsReceived).to.be.empty;
          });
        });
      });
    });
  });
});
