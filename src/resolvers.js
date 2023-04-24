const bcrypt = require('bcrypt');
const jwt = require('../auth/jwt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const resolvers = {
  Mutation: {
    async login(parent, { email, password }, { req, res }) {
      try {
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          await prisma.login_log.create({
            data: {
              user_id: null,
              ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
              login_time: new Date(),
              status: 'failed',
              session_token: null
            },
          });
          throw new Error('Invalid login credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          await prisma.login_log.create({
            data: {
              user_id: user.id,
              ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
              login_time: new Date(),
              status: 'failed',
              session_token: null
            },
          });
          throw new Error('Invalid login credentials');
        }

        const token = jwt.signToken({ userId: user.id });
        await prisma.login_log.create({
          data: {
            user_id: user.id,
            ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            login_time: new Date(),
            status: 'success',
            session_token: token
          },
        });

        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return { value: token };
      } catch (error) {
        console.log(error);
        throw new Error(error.message);
      }
    },
  },
};

module.exports = resolvers;