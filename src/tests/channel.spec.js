import { expect } from 'chai';

import * as api from './api';

describe('message channels', function() {
  after(async function() {
    await api.eraseTables();
  });

  context('mutation', function() {
    describe('createChannel', function() {
      context('user is not authenticated', function() {
        it('returns an errors because only authenticated user can create a channel', async function() {
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
      context('user is authenticated', function() {
        before(async function() {
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
          this.token = token;
        });
        it('returns the newly created channel when valid data is given', async function() {
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

          const result = await api.createChannel(
            {
              title: 'classmates',
              description: 'a channel for my classmate and i',
            },
            this.token,
          );

          expect(result.data).to.eql(expectedResult);
        });
      });
    });
  });
});
