const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    email: String!
    gender: String!
    city: String!
  }

  type Token {
    value: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): Token
  }
`;

module.exports = typeDefs;
