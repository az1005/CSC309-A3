const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SECRET_KEY = process.env.JWT_SECRET || 'secret-key'; // later store secret key in an env variable

const jwtAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }

  jwt.verify(token, SECRET_KEY, async (err, payload) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    try {
      // assume the token payload contains a field called userId
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User not found' });
      }
      // attach the user to the request and proceed
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

module.exports = { jwtAuth };