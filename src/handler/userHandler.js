const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /users
const getUsersHandler = async (request, h) => {
  const users = await prisma.user.findMany();
  return h.response(users).code(200);
};

// GET /users/{id}
const getUserByIdHandler = async (request, h) => {
  const { id } = request.params;
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });

  if (!user) {
    return h.response({ message: 'User  not found' }).code(404);
  }

  return h.response(user).code(200);
};

// PUT /users/{id}
const updateUserHandler = async (request, h) => {
  const { id } = request.params;
  const { username, email, password } = request.payload;

  const hashedPassword = await bcrypt.hash(password, 10);
  const updatedUser = await prisma.user.update({
    where: { id: Number(id) },
    data: { username, email, password: hashedPassword },
  });

  return h.response(updatedUser).code(200);
};

// DELETE /users/{id}
const deleteUserHandler = async (request, h) => {
  const { id } = request.params;
  await prisma.user.delete({ where: { id: Number(id) } });
  return h.response({ message: 'User  deleted successfully' }).code(204);
};

module.exports = {
  getUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
};
