import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    addMembers(channelId: ID!, usersIds: [ID!]!): [Member!]!
  }

  type Member {
    id: ID!
    user: User!
    channel: Channel!
  }
`;
