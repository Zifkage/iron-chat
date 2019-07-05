import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);
import { Op } from 'sequelize';

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

    describe('acceptFriendshipDemand(demandId: ID!): Boolean!', function() {
      context('user is authenticated', function() {
        describe('the demand does not exist', function() {
          before(async function() {
            const response = await api.acceptFriendshipDemand(
              { demandId: 200 },
              this.tokens.zifstarkToken,
            );
            this.errorMessage = response.data.errors[0].message;
          });

          it('returns an error', function() {
            expect(this.errorMessage).to.eql(
              'The demand does not exist.',
            );
          });
        });
        describe('the user is not the receiver', function() {
          before(async function() {
            const demand = await models.Demand.create({
              from: 2,
              to: 3,
            });
            const response = await api.acceptFriendshipDemand(
              {
                demandId: demand.id,
              },
              this.tokens.zifstarkToken,
            );

            this.errorMessage = response.data.errors[0].message;
          });

          it('should returns an error', function() {
            expect(this.errorMessage).to.eql(
              'Not authenticated as owner.',
            );
          });
        });

        describe('the user is the receiver', function() {
          before(async function() {
            const demand = await models.Demand.create({
              from: 2,
              to: 1,
            });
            const response = await api.acceptFriendshipDemand(
              {
                demandId: demand.id,
              },
              this.tokens.zifstarkToken,
            );
            this.demand = await models.Demand.findByPk(demand.id);
            this.friendships = await models.Friendship.findAll({
              where: {
                [Op.or]: [
                  { userId: 1, friendId: 2 },
                  { userId: 2, friendId: 1 },
                ],
              },
            });
            this.acceptFriendshipDemand =
              response.data.data.acceptFriendshipDemand;
          });

          it('should return true', function() {
            expect(this.acceptFriendshipDemand).to.be.true;
          });

          it('the demand.accepted should be true', function() {
            expect(this.demand.accepted).to.be.true;
          });

          it('the sender and the receiver should be friend', function() {
            expect(this.friendships).to.have.lengthOf(2);
            expect(this.friendships).to.containSubset([
              {
                userId: 1,
                friendId: 2,
              },
              {
                userId: 2,
                friendId: 1,
              },
            ]);
          });
        });
      });
    });
  });

  describe('query', function() {
    describe('friendshipDemands(filter: "recieved"): [Demand!]!', function() {
      context('user is authenticated', function() {
        describe('user did not receive any demand', function() {
          before(async function() {
            const response = await api.friendshipDemands(
              { filter: 'received' },
              this.tokens.zifstarkToken,
            );
            this.friendshipDemands =
              response.data.data.friendshipDemands;
          });

          it('should returns an empty array', function() {
            expect(this.friendshipDemands).to.be.empty;
          });
        });

        describe('user recieved two demand', function() {
          before(async function() {
            await models.Demand.destroy({ where: { to: 1 } });
            await models.Demand.bulkCreate([
              {
                from: 2,
                to: 1,
              },
              {
                from: 3,
                to: 1,
              },
            ]);

            const response = await api.friendshipDemands(
              { filter: 'received' },
              this.tokens.zifstarkToken,
            );
            this.friendshipDemands =
              response.data.data.friendshipDemands;
          });

          it('should returns an array of demands', function() {
            expect(this.friendshipDemands).to.deep.equal([
              {
                from: { id: '2' },
                to: { id: '1' },
                accepted: false,
              },
              {
                from: { id: '3' },
                to: { id: '1' },
                accepted: false,
              },
            ]);
          });
        });
      });
    });

    describe('friendshipDemands(filter: "sent"): [Demand!]!', function() {
      context('user is authenticated', function() {
        describe('user did not send any demand', function() {
          before(async function() {
            await models.Demand.destroy({
              where: {
                from: 1,
              },
            });
            const response = await api.friendshipDemands(
              { filter: 'sent' },
              this.tokens.zifstarkToken,
            );
            this.friendshipDemands =
              response.data.data.friendshipDemands;
          });

          it('should returns an empty array', function() {
            expect(this.friendshipDemands).to.be.empty;
          });
        });

        describe('user sent two demand', function() {
          before(async function() {
            await models.Demand.destroy({
              where: {
                from: 3,
              },
            });
            await models.Demand.bulkCreate([
              {
                from: 3,
                to: 1,
              },
              {
                from: 3,
                to: 2,
              },
            ]);

            const response = await api.friendshipDemands(
              { filter: 'sent' },
              this.tokens.billToken,
            );
            this.friendshipDemands =
              response.data.data.friendshipDemands;
          });

          it('should returns an array of demands', function() {
            expect(this.friendshipDemands).to.deep.equal([
              {
                from: { id: '3' },
                to: { id: '1' },
                accepted: false,
              },
              {
                from: { id: '3' },
                to: { id: '2' },
                accepted: false,
              },
            ]);
          });
        });
      });
    });
  });
});
