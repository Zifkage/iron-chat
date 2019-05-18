import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    createChannel(title: String!, description: String): Channel!
    deleteChannel(id: ID!): Boolean!
  }

  type Channel {
    id: ID!
    title: String!
    description: String
    user: User!
  }
`;
