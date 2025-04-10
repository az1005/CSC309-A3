const repository = require('../repositories/repository');
const { validatePositiveNumber, validateIdArray, validateBooleanField } = require('../util/helpers');

async function validatePromotionIds(promotionIds, utorid) {
    // assume that promotionIds is an array
    // retrieve the user record by utorid
    const user = await repository.findUserByUtorid(utorid);
    if (!user) {
        const error = new Error('User not found');
        error.code = 'NOT_FOUND';
        throw error;
    }
    const userId = user.id;
    const now = new Date();

    // loop over each promotionId and validate
    for (const promoId of promotionIds) {
        // assume promoId is a valid positive integer
        // check if promo exists, has expired, or hasn't started yet
        const promotion = await repository.getPromotionById(promoId);
        if (!promotion) {
            const error = new Error(`Promotion with id ${promoId} does not exist`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        if (now > promotion.endTime) {
            const error = new Error(`Promotion with id ${promoId} has expired`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        if (promotion.startTime > now) {
            const error = new Error(`Promotion with id ${promoId} has not started yet`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        // check if the promotion has already been used by the user
        const userPromo = await repository.getUserPromotion(userId, promoId);

        if (userPromo) {
            const error = new Error(`Promotion with id ${promoId} has already been used by this user`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    return true;
}

async function applyPromotions(spent, promotionIds, utorid) {
    // retrieve user with utorid
    const user = await repository.findUserByUtorid(utorid);
    // shouldn't happen bcs we already checked
    if (!user) {
        const error = new Error('User not found');
        error.code = 'NOT_FOUND';
        throw error;
    }

    // assume promotionIds has been validated and we 
    // can apply all the assocaited promos
    let base = Math.round(spent / 0.25);
    let bonus = 0;
    const appliedIds = [];
    for (const promoId of promotionIds) {
        const promotion = await repository.getPromotionById(promoId);
        // shouldn't happen by assumption
        if (!promotion) {
            const error = new Error(`Promotion with id ${promoId} does not exist`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        // check if we spent enough to use this promo
        if (promotion.minSpending <= spent) {
            base += promotion.rate !== 0 ? Math.round(spent / promotion.rate) : 0;
            bonus += promotion.points;

            // if promo is a one time used, 
            // mark it as applied in the user promo model
            if (promotion.type === 'one-time') {
                await repository.createUserPromotion(user.id, promoId);
            }

            // we will have to mark this as an applied promotion to later update
            // the promotions applied to this transaction since the transaction
            // entry does not exist at this point in time
            appliedIds.push(promoId);
        }
    }
    const amount = base + bonus;
    return { amount, appliedIds };

}

async function createPurchase(payload, currentUser) {
    // clean the payload and convert null to undefined
    const cleanPayload = Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [key, value === null ? undefined : value])
    );
    let { utorid, type, spent, promotionIds, remark } = cleanPayload;

    // validate payload
    if (typeof (utorid) !== 'string') {
        const error = new Error("Invalid utorid, must be a string.");
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    // type was checked in controller
    // assert type === 'purchase';

    spent = validatePositiveNumber(spent, 'spent');

    if (promotionIds !== undefined) {
        promotionIds = validateIdArray(promotionIds, 'promotionId', true);
    } else {
        // if not defined, set it as an empty array
        promotionIds = [];
    }

    if (remark !== undefined && typeof (remark) !== 'string') {
        const error = new Error("Invalid remark, must be a string.");
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // validate utorid is a valid user and can use the listed promos
    // throws an error if there is an issue
    await validatePromotionIds(promotionIds, utorid);

    const { amount, appliedIds } = await applyPromotions(spent, promotionIds, utorid);

    const details = {
        owner: { connect: { utorid } },
        amount,
        type,
        spent,
        // if remark is undefined, set as empty string instead
        remark: remark !== undefined ? remark : "",
        createdBy: currentUser.utorid,
        suspicious: currentUser.role === 'cashier' ? currentUser.suspicious : false
    }

    const purchase = await repository.createTransaction(details);
    // should exist, if it doesn't smtg wrong with creation
    if (!purchase) {
        throw new Error("Error creating purchase transaction");
    }

    // if not suspicious, immediately update the user's points
    if (!purchase.suspicious) {
        await repository.updateUserPoints(utorid, purchase.amount);
    }

    // for each applied promotion, mark it in the 
    // promotions used for this transaction
    for (const promoId of appliedIds) {
        await repository.createTransactionPromotion(purchase.id, promoId);
    }

    const filteredPurchase = {
        id: purchase.id,
        utorid: purchase.utorid,
        type: purchase.type,
        spent: purchase.spent,
        earned: purchase.suspicious ? 0 : purchase.amount,
        remark: purchase.remark,
        // this might be wrong, maybe has to be purchase.transactionPromotions.length?
        promotionIds,
        createdBy: purchase.createdBy
    };

    return filteredPurchase;

}

async function createAdjustment(payload, currentUser) {
    // clean and destructure payload
    const cleanPayload = Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [key, value === null ? undefined : value])
    );
    let { utorid, type, amount, relatedId, promotionIds, remark } = cleanPayload;

    // check currentUser, must be manager or higher => cannot be cashier
    if (currentUser.role === 'cashier') {
        const error = new Error("Forbidden, cannot adjust a transaction as a cashier");
        error.code = 'FORBIDDEN';
        throw error;
    }

    // validate payload data:
    if (typeof (utorid) !== 'string') {
        const error = new Error("Invalid utorid, must be a string.");
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    // type was checked in controller
    // assert type === 'adjustment';

    // amount must be an integer (can be negative)
    const amountInt = parseInt(amount, 10);
    const amountFloat = parseFloat(amount, 10);
    if (isNaN(amountInt) || amountInt !== amountFloat) {
        const error = new Error('Invalid amount, must be an integer');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    amount = amountInt;

    relatedId = validatePositiveNumber(relatedId, 'relatedId', true);

    if (promotionIds !== undefined) {
        promotionIds = validateIdArray(promotionIds, 'promotionId', true);
    } else {
        // if not defined, set it as an empty array
        promotionIds = [];
    }

    if (remark !== undefined) {
        if (typeof (remark) !== 'string') {
            const error = new Error("Invalid remark, must be a string.");
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    } else {
        // remark is undefined, set it to an empty string instead
        remark = "";
    }

    // validate utorid is a valid user and can use the listed promos
    // throws an error if there is an issue
    await validatePromotionIds(promotionIds, utorid);

    // validate that relatedId is a transaction id:
    const transaction = await repository.getTransactionById(relatedId);
    if (!transaction) {
        const error = new Error("Could not find a transaction with this relatedId.");
        error.code = 'NOT_FOUND';
        throw error;
    }

    // throw an error if transaction is suspicious, should first verify the transaction
    if (transaction.suspicious) {
        const error = new Error("Verify this transaction before adjustment");
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // passes all checks, create the adjustment
    const details = {
        owner: { connect: { utorid } },
        amount,
        type,
        remark,
        createdBy: currentUser.utorid,
        suspicious: false,
        relatedId
    };

    const adjustment = await repository.createTransaction(details);
    // should exist, if it doesn't smtg wrong with creation
    if (!adjustment) {
        throw new Error("Error creating adjustment transaction");
    }

    // immediately update user's points
    await repository.updateUserPoints(utorid, adjustment.amount);

    // update the list of promos used for this transaction
    // for each applied promotion, mark it in the 
    // promotions used for this transaction
    for (const promoId of promotionIds) {
        await repository.createTransactionPromotion(purchase.id, promoId);
    }

    const filteredAdjustment = {
        id: adjustment.id,
        utorid: adjustment.utorid,
        amount: adjustment.amount,
        type: adjustment.type,
        relatedId: adjustment.relatedId,
        remark: adjustment.remark,
        promotionIds,
        createdBy: adjustment.createdBy
    };

    return filteredAdjustment;

}

async function getTransactions(payload) {
    // clean the payload and convert null to undefined
    const cleanPayload = Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [key, value === null ? undefined : value])
    );

    let { name, createdBy, suspicious, promotionId,
        type, relatedId, amount, operator, page = 1, limit = 10,
        order, orderBy } = cleanPayload;

    // create filters
    const filters = {};

    // validate payload data
    if (name !== undefined) {
        if (typeof (name) !== 'string') {
            const error = new Error('Invalid name, must be a string');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        filters.utorid = name;
    }

    if (createdBy !== undefined) {
        if (typeof (createdBy) !== 'string') {
            const error = new Error('Invalid createdBy, must be a string');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        filters.createdBy = createdBy
    }
    if (suspicious !== undefined) {
        suspicious = validateBooleanField(suspicious, 'suspicious');
        filters.suspicious = suspicious;
    }

    if (promotionId !== undefined) {
        promotionId = validatePositiveNumber(promotionId, 'promotionId', true);
        filters.promotionId = promotionId;
    }

    const allowedTypes = ['purchase', 'adjustment', 'transfer', 'redemption', 'event'];
    if (type !== undefined) {
        if (typeof (type) !== 'string' || !allowedTypes.includes(type)) {
            const error = new Error(`Invalid type, must be one of: ${allowedTypes.join(', ')}.`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        filters.type = type;

        if (relatedId !== undefined) {
            relatedId = validatePositiveNumber(relatedId, 'relatedId', true);
            filters.relatedId = relatedId;
        }
    } else if (relatedId !== undefined) {
        // type is undefined, but relatedId is provided
        const error = new Error('Must use relatedId with type');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    if (amount !== undefined && operator !== undefined) {
        amount = parseFloat(amount);
        if (isNaN(amount)) {
            const error = new Error('Invalid amount, must be a number');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }

        const allowedOperators = ['gte', 'lte'];
        if (typeof (operator) !== 'string' || !allowedOperators.includes(operator)) {
            const error = new Error(`Invalid operator, must be one of: ${allowedOperators.join(', ')}.`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }

        filters.amount = { [operator]: amount };

    } else if (amount !== undefined || operator !== undefined) {
        const error = new Error('amount and operator must be specified together');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    if (page !== undefined) {
        page = validatePositiveNumber(page, 'page', true);
    }
    if (limit !== undefined) {
        limit = validatePositiveNumber(limit, 'limit', true);
    }
    if (page < 1 || limit < 1) {
        const error = new Error('page/limit must be at least 1');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // validate order and orderBy
    if (order !== undefined && orderBy !== undefined) {
        const sortableFields = ['utorid', 'amount', 'type', 'relatedId', 'suspicious', 'remark', 'createdBy'];
        if (orderBy !== undefined && !sortableFields.includes(orderBy)) {
            const error = new Error(`Invalid "orderBy" field, must be one of: ${sortableFields.join(', ')}`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }

        if (order !== undefined && !['asc', 'desc'].includes(order.toLowerCase())) {
            const error = new Error('Invalid "order" value, must be "asc" or "desc".');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    } else if (order !== undefined || orderBy !== undefined) {
        const error = new Error('order and orderBy must be specified together');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // build the sort options
    const sortOptions = (order && orderBy) ? { field: orderBy, direction: order } : undefined

    const skip = (page - 1) * limit;

    const { count, results } = await repository.getTransactionsWithFilters(filters, skip, limit, sortOptions);

    const filteredResults = results.map(t => {
        const rawTransaction = {
            id: t.id,
            utorid: t.utorid,
            amount: t.amount,
            type: t.type,
            spent: t.spent,
            relatedId: t.relatedId,
            promotionIds: t.transactionPromotions.map(tp => tp.promotion.id),
            suspicious: t.suspicious,
            redeemed: t.redeemed,
            remark: t.remark,
            createdBy: t.createdBy
        };

        // remove fields with null values
        const filteredTransaction = Object.fromEntries(
            Object.entries(rawTransaction).filter(([key, value]) => value !== null)
        );

        return filteredTransaction;
    });

    return { count, results: filteredResults };

}

async function getTransactionById(transactionId) {
    transactionId = validatePositiveNumber(transactionId, 'transactionId', true);

    const transaction = await repository.getTransactionById(transactionId);
    if (!transaction) {
        const error = new Error('Transaction not found');
        error.code = 'NOT_FOUND';
        throw error;
    }

    const rawTransaction = {
        id: transaction.id,
        utorid: transaction.utorid,
        type: transaction.type,
        spent: transaction.spent,
        amount: transaction.amount,
        relatedId: transaction.relatedId,
        promotionIds: transaction.transactionPromotions.map(tp => tp.promotion.id),
        suspicious: transaction.suspicious,
        redeemed: transaction.redeemed,
        remark: transaction.remark,
        createdBy: transaction.createdBy
    }

    const filteredTransaction = Object.fromEntries(
        Object.entries(rawTransaction).filter(([key, value]) => value !== null)
    );

    return filteredTransaction;

}

async function updateTransactionSuspicious(payload, transactionId) {
    let { suspicious } = payload;
    suspicious = validateBooleanField(suspicious, 'suspicious');
    transactionId = validatePositiveNumber(transactionId, 'transactionId', true);

    const originalTransaction = await repository.getTransactionById(transactionId);

    if (!originalTransaction) {
        const error = new Error('Transaction not found');
        error.code = 'NOT_FOUND';
        throw error;
    }

    // not sure if we should throw error or do a no op
    if (originalTransaction.suspicious === suspicious) {
        const error = new Error('Transaction already has this value for suspicious');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    const transaction = await repository.updateTransactionSuspicious(transactionId, suspicious);

    // if we mark the transaction as suspicious, deduct the amount from the user
    // if we verify the transaction, immediately add amount to user
    const utorid = transaction.utorid;
    let amount;
    if (suspicious) {
        amount = -transaction.amount;
    } else {
        amount = transaction.amount;
    }
    await repository.updateUserPoints(utorid, amount);

    // filter the transaction to return
    const rawTransaction = {
        id: transaction.id,
        utorid: transaction.utorid,
        type: transaction.type,
        spent: transaction.spent,
        amount: transaction.amount,
        relatedId: transaction.relatedId,
        promotionIds: transaction.transactionPromotions.map(tp => tp.promotion.id),
        suspicious: transaction.suspicious,
        redeemed: transaction.redeemed,
        remark: transaction.remark,
        createdBy: transaction.createdBy
    }

    const filteredTransaction = Object.fromEntries(
        Object.entries(rawTransaction).filter(([key, value]) => value !== null)
    );

    return filteredTransaction;
}

async function processRedemption(payload, transactionId, currentUser) {
    let { processed } = payload;
    processed = validateBooleanField(processed, 'processed');
    if (!processed) {
        const error = new Error('Invalid processed, must be true');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    transactionId = validatePositiveNumber(transactionId, 'transactionId', true);

    const pending = await repository.getTransactionById(transactionId);

    if (!pending) {
        const error = new Error('Transaction not found');
        error.code = 'NOT_FOUND';
        throw error;
    }

    if (pending.type !== 'redemption') {
        const error = new Error('Cannot process a non redemption transaction');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    if (pending.processed) {
        const error = new Error('Transaction already processed');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // passes all checks, process this redemption
    const updates = {
        redeemed: -pending.amount,
        // relatedId in a processed transction is the id of the user who processed
        relatedId: currentUser.id,
        processed
    };
    const processedRedemption = await repository.updateTransactionProcess(transactionId, updates);

    // deduct points from user's balance
    // the redemption's amount is the deducted amount
    await repository.updateUserPoints(processedRedemption.utorid, processedRedemption.amount);

    const response = {
        id: processedRedemption.id,
        utorid: processedRedemption.utorid,
        type: processedRedemption.type,
        processedBy: currentUser.utorid,
        redeemed: processedRedemption.redeemed,
        remark: processedRedemption.remark,
        createdBy: processedRedemption.createdBy
    };

    return response;
}

module.exports = {
    createPurchase, createAdjustment, getTransactions, getTransactionById,
    updateTransactionSuspicious, processRedemption
};