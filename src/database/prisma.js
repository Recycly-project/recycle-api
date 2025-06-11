// Menginisialisasi dan mengekspor instance PrismaClient.
// Ini akan digunakan di seluruh aplikasi untuk interaksi database.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = prisma;
