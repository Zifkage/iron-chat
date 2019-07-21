import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    messages(discussionId: ID!): [Message!]!
    discussionMessages(discussionId: ID!): [Message!]!
  }

  extend type Mutation {
    createMessage(channelId: ID!, text: String!): Message!
  }

  type Message {
    id: ID!
    text: String!
    createdAt: Date!
    user: User!
    discussion: Discussion!
  }

  extend type Subscription {
    messageCreated(channelId: ID!): MessageCreated!
  }

  type MessageCreated {
    message: Message!
  }
`;
