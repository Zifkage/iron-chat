import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    createChannel(title: String!, description: String): Channel!
    deleteChannel(id: ID!): Boolean!
    updateChannel(
      id: ID!
      title: String
      description: String
    ): Boolean!
  }

  extend type Query {
    myChannels: [Channel!]!
  }

  type Channel {
    id: ID!
    title: String!
    description: String
    user: User!
    members: [Member!]!
  }
`;
