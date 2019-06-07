import { expect } from 'chai';

import * as api from './api';

describe('users', function() {
  describe('user(id: String!): User', function() {
    it('returns a user when user can be found', async function() {
      const expectedResult = {
        data: {
          user: {
            id: '1',
            username: 'zifstark',
            email: 'zif@gmail.com',
            roles: ['ADMIN'],
          },
        },
      };

      const result = await api.user({ id: '1' });

      expect(result.data).to.eql(expectedResult);
    });

    it('returns null when user cannot be found', async function() {
      const expectedResult = {
        data: {
          user: null,
        },
      };

      const result = await api.user({ id: '42' });

      expect(result.data).to.eql(expectedResult);
    });
  });
});
