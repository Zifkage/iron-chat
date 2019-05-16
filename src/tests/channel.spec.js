import { expect } from 'chai';

import * as api from './api';

describe('message channels', () => {
  context('mutation', () => {
    describe('createChannel', () => {
      context('user is not authenticated', () => {
        it('returns an errors because only authenticated user can create a channel', async () => {
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
      context('user is authenticated', () => {
        it('returns the newly created channel when valid data is given', async () => {
          const expectedResult = {
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

          const {
            data: {
              data: {
                signIn: { token },
              },
            },
          } = await api.signIn({
            login: 'zifstark',
            password: 'zifstark',
          });

          const result = await api.createChannel(
            {
              title: 'classmates',
              description: 'a channel for my classmate and i',
            },
            token,
          );

          expect(result.data).to.eql(expectedResult);
        });
      });
    });
  });
});
