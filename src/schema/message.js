import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    messages(cursor: String, limit: Int): MessageConnection!
    message(id: ID!): Message
  }

  extend type Mutation {
    createMessage(channelId: ID!, text: String!): Message!
    deleteMessage(id: ID!): Boolean!
    updateMessage(id: ID!, text: String!): Boolean!
  }

  extend type Query {
    channelMessages(channelId: ID!): [Message!]!
  }

  type MessageConnection {
    edges: [Message!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  type Message {
    id: ID!
    text: String!
    createdAt: Date!
    user: User!
    channel: Channel!
  }

  extend type Subscription {
    messageCreated(channelId: ID!): MessageCreated!
  }

  type MessageCreated {
    message: Message!
  }
`;
