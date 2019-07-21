import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    discussions: [Discussion!]!
  }

  extend type Mutation {
    deleteDiscussion(id: ID!): Boolean!
  }

  type Discussion {
    id: ID!
    user: User!
    channel: Channel!
  }
`;
