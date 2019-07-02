import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);

import * as api from './api';

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
    });
  });
});
