import { expect } from 'chai';

import * as api from './api';

describe('users', function() {
  describe('query', function() {
    describe('user(id: String!): User', function() {
      before(async function() {
        this.expectedResult = {
          data: {
            user: {
              id: '1',
              username: 'zifstark',
              email: 'zif@gmail.com',
            },
          },
        };

        this.result = await api.user({ id: '1' });
      });

      it('returns a user when user can be found', async function() {
        expect(this.result.data).to.eql(this.expectedResult);
      });

      before(async function() {
        this.expectedResult = {
          data: {
            user: null,
          },
        };

        this.result = await api.user({ id: '1000000' });
      });

      it('returns null when user cannot be found', async function() {
        expect(this.result.data).to.eql(this.expectedResult);
      });
    });
  });
});
