const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUserByUtorid(utorid) {
    return await prisma.user.findUnique({ where : { utorid } });
}

async function findUserByEmail(email) {
    return await prisma.user.findUnique({ where : { email } });
}

async function createUser(userData) {
    return await prisma.user.create({ data : userData });
}

module.exports = { findUserByUtorid, findUserByEmail, createUser };