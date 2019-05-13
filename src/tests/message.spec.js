import { expect } from 'chai';

import * as api from './api';

describe('messages', () => {
  describe('message(id: String!): Message', () => {
    it('returns a message when message can be found', async () => {
      const expectedResult = {
        data: {
          message: {
            id: '1',
            text: 'Winter is coming!',
            user: {
              username: 'zifstark',
            },
          },
        },
      };
      const { data } = await api.message({ id: '1' });

      expect(data).to.eql(expectedResult);
    });

    it('returns null when message cannot be found', async () => {
      const expectedResult = {
        data: {
          message: null,
        },
      };

      const { data } = await api.message({ id: '200' });

      expect(data).to.eql(expectedResult);
    });
  });

  describe('deleteMessage(id: String!): Message', () => {
    describe('user is not the owner', () => {
      it('returns an error because only owner can delete a message', async () => {
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
        } = await api.deleteMessage({ id: '1' }, token);

        expect(errors[0].message).to.eql(
          'Not authenticated as owner.',
        );
      });
    });
  });
});
