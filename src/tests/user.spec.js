import { expect } from 'chai';

import * as api from './api';

describe('users', () => {
  describe('user(id: String!): User', () => {
    it('returns a user when user can be found', async () => {
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

    it('returns null when user cannot be found', async () => {
      const expectedResult = {
        data: {
          user: null,
        },
      };

      const result = await api.user({ id: '42' });

      expect(result.data).to.eql(expectedResult);
    });
  });

  describe('deleteUser(id: String!): Boolean!', () => {
    describe('user is not an admin', () => {
      it('returns an error because only admins can delete a user', async () => {
        const {
          data: {
            data: {
              signIn: { token },
            },
          },
        } = await api.signIn({
          login: 'ddavids',
          password: 'ddavids',
        });

        const {
          data: { errors },
        } = await api.deleteUser({ id: '1' }, token);

        expect(errors[0].message).to.eql('Not authorized as admin.');
      });
    });
  });
});
