import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    addMembers(channelId: ID!, ids: [ID!]!): Boolean!
  }
`;
