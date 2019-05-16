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
            description: 'a channel for me and my classmate',
          });

          expect(errors[0].message).to.eql(
            'Not authenticated as user.',
          );
        });
      });
    });
  });
});
