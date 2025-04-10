'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const [, , utorid, email, password] = process.argv;

if (!utorid || !email || !password) {
    console.error("usage: node prisma/createsu.js <utorid> <email> <password>");
    process.exit(1);
};

if (!email.endsWith("utoronto.ca")) {
    console.error("error: email must end in utoronto.ca");
    process.exit(1);
};

async function addSuperUser(utorid, email, password) {
    const superUser = {utorid, name : utorid, password, email, verified : true, role : 'superuser'};
    await prisma.user.create({ data: superUser });
}

addSuperUser(utorid, email, password)
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());