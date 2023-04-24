const { ApolloServer } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');

const typeDefs = `
  type Query {
    hello: String
  }

  type Mutation {
    login(email: String!, password: String!): String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
  Mutation: {
    login: async (parent, { email, password }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        throw new Error('Invalid email or password');
      }

      const token = jsonwebtoken.sign({ userId: user.id }, 'secret-key');

      return token;
    },
  },
};

const prisma = new PrismaClient();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { prisma },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
