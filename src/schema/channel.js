import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    createChannel(title: String!, description: String): Channel!
  }

  type Channel {
    title: String!
    description: String
    type: String!
    user: User!
  }
`;
