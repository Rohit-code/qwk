const jwt = require('jsonwebtoken');

const secret = 'your-secret-key';

function signToken(userId) {
  const token = jwt.sign({ userId }, secret, { expiresIn: '1h' });
  return token;
}

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  try {
    const decodedToken = jwt.verify(token, secret);
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => {
    const user = req.user;
    return { user, req, res };
  },
  middleware: [async (resolve, root, args, context, info) => {
    verifyToken(context.req, context.res, () => {});
    const token = context.req.cookies.token || '';
    const decodedToken = jwt.verify(token, secret);
    return resolve();
  }]
});

module.exports = { signToken, verifyToken };
