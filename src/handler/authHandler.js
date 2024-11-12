const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const prisma = new PrismaClient();

// Skema validasi untuk pendaftaran
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// POST /users/auth/register
const registerHandler = async (request, h) => {
  try {
    // Validasi input
    const { error } = registerSchema.validate(request.payload);
    if (error) {
      return h.response({ message: error.details[0].message }).code(400);
    }

    const { username, email, password } = request.payload;

    // Cek apakah email atau username sudah ada
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return h
        .response({ message: 'Username or email already exists' })
        .code(409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Menghilangkan password dari respons
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;

    return h.response(userWithoutPassword).code(201);
  } catch (error) {
    console.error('Error in registerHandler:', error);
    return h.response({ message: 'Internal Server Error' }).code(500);
  }
};

// POST /users/auth/login
const loginHandler = async (request, h) => {
  try {
    const { identifier, password } = request.payload;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return h
        .response({ message: 'Invalid email/username or password' })
        .code(401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return h
        .response({ message: 'Invalid email/username or password' })
        .code(401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return h.response({ token }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ message: 'Internal Server Error' }).code(500);
  }
};

// POST /users/auth/logout
const logoutHandler = async (request, h) => {
  return h.response({ message: 'Logged out successfully' }).code(200);
};

module.exports = {
  registerHandler,
  loginHandler,
  logoutHandler,
};
