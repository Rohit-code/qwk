const { ApolloServer } = require('apollo-server');
const cookieParser = require('cookie-parser');
const typeDefs = require('./src/schema');
const resolvers = require('./src/resolvers');
const { signToken, verifyToken } = require('./src/Auth/jwt');
const prisma = require('./src/helpers').prisma;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => {
    const token = req.cookies.token || '';
    const user = verifyToken(token);
    return { user, req, res, prisma };
  },
});

server.express.use(cookieParser());

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
