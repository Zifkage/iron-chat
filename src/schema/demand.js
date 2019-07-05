import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    sendFriendshipDemand(userId: ID!): Boolean!
  }
  extend type Query {
    friendshipDemandsReceived: [Demand!]!
    friendshipDemandsSent: [Demand!]!
  }
  type Demand {
    id: ID!
    from: User!
    to: User!
    accepted: Boolean!
  }
`;
