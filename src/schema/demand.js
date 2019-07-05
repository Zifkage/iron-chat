import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    sendFriendshipDemand(userId: ID!): Boolean!
    acceptFriendshipDemand(demandId: ID!): Boolean!
  }
  extend type Query {
    friendshipDemands(filter: String!): [Demand!]!
  }
  type Demand {
    id: ID!
    from: User!
    to: User!
    accepted: Boolean!
  }
`;
