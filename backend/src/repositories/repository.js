const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUserByUtorid(utorid) {
    return await prisma.user.findUnique({ where: { utorid } });
}

async function findUserByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
}

async function createUser(userData) {
    return await prisma.user.create({ data: userData });
}

async function createResetToken(userId, token, expiresAt) {
    return await prisma.resetToken.create({
        data: {
            token,
            user: { connect: { id: userId } },
            expiresAt
        }
    })
}

async function getResetToken(token) {
    return await prisma.resetToken.findUnique({
        where: { token },
        include: { user: true }
    })
}

async function invalidateAllResetTokens(userId) {
    await prisma.resetToken.updateMany({
        where: { userId, isExpired: false },
        data: { isExpired: true }
    });
}

async function updatePassword(utorid, password) {
    return await prisma.user.update({
        where: { utorid },
        data: { password }
    })
}

async function getUsersWithFilters(filters, skip, take, sortOptions = undefined) {
    const [count, results] = await Promise.all([
        prisma.user.count({ where: filters }),
        prisma.user.findMany({
            where: filters,
            skip,
            take,
            orderBy: sortOptions ? { [sortOptions.field]: sortOptions.direction } : undefined
        })
    ]);
    return { count, results };
}

async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userPromotions: {
                include: {
                    promotion: true
                }
            },
            transactions: true,
            eventsAsGuest: true,
            eventsAsOrganizer: true
        }
    });
    return user;
}

async function updateLastLogin(utorid) {
    const lastLogin = new Date();
    return await prisma.user.update({
        where: { utorid },
        data: { lastLogin }
    });
}

async function updateUser(userId, updateFields) {
    return await prisma.user.update({
        where: { id: userId },
        data: updateFields,
    });
}

async function createPromotion(details) {
    return await prisma.promotion.create({ data: details })
}

async function getPromotionsWithFilters(filters, skip, take, sortOptions = undefined) {
    const [count, results] = await Promise.all([
        prisma.promotion.count({ where: filters }),
        prisma.promotion.findMany({
            where: filters,
            skip, 
            take,
            orderBy: sortOptions ? { [sortOptions.field]: sortOptions.direction } : undefined
        })
    ]);
    return { count, results };
}

async function getPromotionById(id) {
    return await prisma.promotion.findUnique({ where: { id } })
}

async function updatePromotion(promoId, updateFields) {
    return await prisma.promotion.update({
        where: { id: promoId },
        data: updateFields,
    });
}

async function deletePromotion(promoId) {
    return await prisma.promotion.delete({ where: { id: promoId } });
}

async function createEvent(details) {
    return await prisma.event.create({
        data: details,
        include: {
            organizers: true,
            guests: true
        }
    });
}

async function getEventsWithFilters(filters, skip, take) {
    const [count, results] = await Promise.all([
        prisma.event.count({
            where: filters
        }),
        prisma.event.findMany({
            where: filters,
            include: { guests: true },
            skip,
            take
        })
    ]);
    return { count, results };
}

async function getEventById(id) {
    return await prisma.event.findUnique({
        where: { id },
        include: {
            organizers: true,
            guests: true
        }
    });
}

async function updateEvent(eventId, updateFields) {
    return await prisma.event.update({
        where: { id: eventId },
        data: updateFields,
    });
}

async function deleteEvent(eventId) {
    return await prisma.event.delete({ where: { id: eventId } });
}

async function addOrganizerToEvent(eventId, userId) {
    return await prisma.event.update({
        where: { id: eventId },
        data: {
            organizers: {
                connect: { id: userId }
            }
        },
        select: {
            id: true,
            name: true,
            location: true,
            organizers: {
                select: {
                    id: true,
                    utorid: true,
                    name: true
                }
            }
        }
    });
}

async function deleteOrganizerFromEvent(eventId, userId) {
    return await prisma.event.update({
        where: { id: eventId },
        data: {
            organizers: {
                disconnect: { id: userId }
            }
        }
    });
}

async function addGuestToEvent(eventId, userId) {
    return await prisma.event.update({
        where: { id: eventId },
        data: {
            guests: {
                connect: { id: userId }
            }
        },
        select: {
            id: true,
            name: true,
            location: true,
            guests: {
                select: {
                    id: true,
                    utorid: true,
                    name: true
                }
            }
        }
    });
}

async function deleteGuestFromEvent(eventId, userId) {
    return await prisma.event.update({
        where: { id: eventId },
        data: {
            guests: {
                disconnect: { id: userId }
            }
        }
    });
}

async function getUserPromotion(userId, promotionId) {
    // search for the matching unique composite key userId_promotionId
    return await prisma.userPromotions.findUnique({
        where: { userId_promotionId: { userId, promotionId } }
    });
}

async function createUserPromotion(userId, promotionId) {
    // indicate this user has used this one time promotion
    return await prisma.userPromotions.create({
        data: {
            user: { connect: { id: userId } },
            promotion: { connect: { id: promotionId } }
        }
    });
}

async function createTransaction(details) {
    return await prisma.transaction.create({ data: details });
}

async function createTransactionPromotion(transactionId, promotionId) {
    // indicate this transaction was applied with this promotion
    return await prisma.transactionPromotions.create({
        data: {
            transaction: { connect: { id: transactionId } },
            promotion: { connect: { id: promotionId } }
        }
    });
}

async function updateUserPoints(utorid, amount) {
    return await prisma.user.update({
        where: { utorid },
        data: { points: { increment: amount } }
    });
}

async function getTransactionById(transactionId) {
    return await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
            transactionPromotions: {
                include: {
                    promotion: true
                }
            }
        }
    });
}

async function getTransactionsWithFilters(filters, skip, take, sortOptions = undefined) {
    const [count, results] = await Promise.all([
        prisma.transaction.count({
            where: filters
        }),
        prisma.transaction.findMany({
            where: filters,
            include: {
                transactionPromotions: {
                    include: {
                        promotion: true
                    }
                }
            },
            skip,
            take,
            orderBy: sortOptions ?
                { [sortOptions.field]: sortOptions.direction } : undefined
        })
    ]);
    return { count, results };
}

async function updateTransactionSuspicious(transactionId, suspicious) {
    return await prisma.transaction.update({
        where: { id: transactionId },
        include: {
            transactionPromotions: {
                include: {
                    promotion: true
                }
            }
        },
        data: { suspicious }
    });
}

async function updateTransactionProcess(transactionId, updateFields) {
    return await prisma.transaction.update({
        where: { id: transactionId },
        data: updateFields
    });
}

async function updateEventPoints(eventId, amount) {
    return await prisma.event.update({
        where: { id: eventId },
        data: {
            pointsAwarded: { increment: amount },
            pointsRemain: { decrement: amount }
        }
    });
}

async function getAllEventsWithFilters(filters) {
    return await prisma.event.findMany({
        where: filters,
        include: { guests: true }
    });
}

module.exports = {
    findUserByUtorid, findUserByEmail, createUser, createResetToken,
    getResetToken, invalidateAllResetTokens, updatePassword,
    getUsersWithFilters, getUserById, updateLastLogin, updateUser,
    createPromotion, getPromotionsWithFilters, getPromotionById,
    updatePromotion, deletePromotion, createEvent, getEventsWithFilters,
    getEventById, updateEvent, deleteEvent, addOrganizerToEvent,
    deleteOrganizerFromEvent, addGuestToEvent, deleteGuestFromEvent,
    getUserPromotion, createUserPromotion, createTransaction,
    createTransactionPromotion, updateUserPoints, getTransactionById,
    getTransactionsWithFilters, updateTransactionSuspicious,
    updateTransactionProcess, updateEventPoints, getAllEventsWithFilters
};