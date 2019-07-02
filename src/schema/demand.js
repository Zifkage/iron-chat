import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    sendFriendshipDemand(userId: ID!): Boolean!
  }
`;
