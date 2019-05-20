import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (_parent, _args, { me }) =>
  me ? skip : new ForbiddenError('Not authenticated as user.');

export const isAdmin = combineResolvers(
  isAuthenticated,
  (_parent, _args, { me: { roles } }) =>
    roles.includes('ADMIN')
      ? skip
      : new ForbiddenError('Not authorized as admin.'),
);

export const isOwner = (modelName, idField = 'id') => async (
  _parent,
  { [idField]: id },
  { models, me },
) => {
  const entry = await models[modelName].findByPk(id, { raw: true });
  if (!entry) {
    return skip;
  }
  if (entry.userId !== me.id) {
    throw new ForbiddenError('Not authenticated as owner.');
  }

  return skip;
};
