const repository = require('../repositories/repository');
const { generateResetTokenUUID, getExpiryDate,
    isValidBirthday, validateBooleanField,
    validatePassword,
    validatePositiveNumber } = require('../util/helpers');

async function registerUser({ utorid, name, email }) {
    // validate payload
    if (typeof (utorid) !== 'string' || utorid.length !== 8) {
        const error = new Error('Invalid utorid, must be 8 alphanumeric characters.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    if (typeof (name) !== 'string' || name.length > 50 || name.length < 1) {
        const error = new Error('Invalid name.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    if (typeof (email) !== 'string' || !email.endsWith('utoronto.ca')) {
        const error = new Error('Invalid email, must be a utoronto.ca email.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // check if a user with the same utorid or email already exists
    const sameUtorid = await repository.findUserByUtorid(utorid);
    if (sameUtorid) {
        const error = new Error('User with that utorid already exists.');
        error.code = 'USER_EXISTS';
        throw error;
    }

    const sameEmail = await repository.findUserByEmail(email);
    if (sameEmail) {
        const error = new Error('User with that email already exists.');
        error.code = 'USER_EXISTS';
        throw error;
    }

    // passes all the checks, initialize user and resetToken
    const resetToken = generateResetTokenUUID();
    const expiresAt = getExpiryDate(7 * 24); // user has 7 * 24 hours to activate

    const newUserData = {
        utorid,
        name,
        email,
        verified: false
    };

    const newUser = await repository.createUser(newUserData);
    const token = await repository.createResetToken(newUser.id, resetToken, expiresAt);
    // attach the reset token and expiration date for response
    return { newUser, resetToken, expiresAt };
}

async function getUsers(payload) {
    let { name, role, verified, activated, page = 1, limit = 10, order, orderBy } = payload;

    // validate payload with typechecks:
    if (name !== undefined && typeof name !== 'string') {
        const error = new Error('Invalid "name" filter, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // also check if role is an expected role
    const allowedRoles = ['regular', 'cashier', 'manager', 'superuser'];
    if (role !== undefined) {
        if (typeof role !== 'string') {
            const error = new Error('Invalid "role" filter, must be a string.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        if (!allowedRoles.includes(role)) {
            const error = new Error(`Invalid "role" filter, must be one of: ${allowedRoles.join(', ')}.`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    // use helper function to validate boolean field
    // helper will throw a bad payload error if not valid
    verified = validateBooleanField(verified, 'verified');
    activated = validateBooleanField(activated, 'activated');

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) {
        const error = new Error('Invalid "page" number, must be a positive number.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (isNaN(limit) || limit < 1) {
        const error = new Error('Invalid "limit", must be a positive number.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // validate order and orderBy
    order = order !== null ? order : undefined
    orderBy = orderBy !== null ? orderBy : undefined
    if (order !== undefined && orderBy !== undefined) {
        if (orderBy === 'activated') orderBy = 'lastLogin';
        const sortableFields = ['utorid', 'name', 'email', 'role', 'verified', 'lastLogin', 'points'];
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


    // build query filter object based on the provided payload
    const filters = {};
    if (name) {
        // filter by exact match if name is the utorid or name
        filters.OR = [
            { utorid: name },
            { name }
        ];
    };
    if (role) filters.role = role;
    if (verified !== undefined) filters.verified = verified;
    if (activated !== undefined) {
        // check whether the user has logged in at least once (not null)
        filters.lastLogin = activated ? { not: null } : null;
    }

    // calculate page offsets
    const skip = (page - 1) * limit;

    // build the sort options
    const sortOptions = (order && orderBy) ? { field: orderBy, direction: order } : undefined

    const { count, results } = await repository.getUsersWithFilters(filters, skip, limit, sortOptions);

    return { count, results };
}

async function getUserById(userId, currentUser) {
    userId = parseInt(userId, 10);
    if (isNaN(userId)) {
        const error = new Error('Invalid "userId", must be a number');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    const user = await repository.getUserById(userId);
    if (!user) {
        const error = new Error('User not found');
        error.code = 'USER_NOT_FOUND';
        throw error;
    }

    const skip = 0;
    const limit = 10;
    const now = new Date();
    let filters;

    if (currentUser.role === 'cashier') {
        filters = {
            startTime: { lte: now },
            endTime: { gt: now },
            type: 'one-time'
        }
    } else {
        // must be manager/superuser, show all active promotions regardless of type
        filters = {
            startTime: { lte: now },
            endTime: { gt: now }
        }
    }

    const { count, results } = await repository.getPromotionsWithFilters(filters, skip, limit);

    let promos;

    if (currentUser.role === 'cashier') {
        const usedPromoIds = new Set(user.userPromotions.map(up => up.promotion.id));
        promos = results.filter(promo => !usedPromoIds.has(promo.id));
    } else {
        promos = results;
    }

    promos = promos.map(p => {
        return {
            id: p.id,
            name: p.name,
            minSpending: p.minSpending,
            rate: p.rate,
            points: p.points,
        };
    });

    return { user, promos };
}

async function updateUserStatus(payload, currentUser, userId) {
    let { email, verified, suspicious, role } = payload;
    // if null, convert to undefined for each field:
    email = email === null ? undefined : email;
    verified = verified === null ? undefined : verified;
    suspicious = suspicious === null ? undefined : suspicious;
    role = role === null ? undefined : role;

    // place the userId check here so we can use it in email check
    userId = parseInt(userId, 10);
    if (isNaN(userId)) {
        const error = new Error('Invalid "userId", must be a number.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    const superuserAllowedRoles = ['regular', 'cashier', 'manager', 'superuser'];
    const managerAllowedRoles = ['regular', 'cashier'];

    // check payload
    if (email !== undefined) {
        if (typeof (email) !== 'string' || !email.endsWith('utoronto.ca')) {
            const error = new Error('Invalid email, must be a utoronto.ca email.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        const sameEmail = await repository.findUserByEmail(email);
        if (sameEmail && sameEmail.id !== userId) {
            const error = new Error('User with that email already exists.');
            error.code = 'USER_EXISTS';
            throw error;
        }
    }

    // verified must be true
    if (verified !== undefined) {
        if (typeof (verified) === 'string' && verified !== 'true' ||
            typeof (verified) === 'boolean' && verified !== true) {
            const error = new Error('Invalid "verified" filter, must be "true".');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        // redundant if verified already boolean but incase it is a string
        verified = true;
    }

    suspicious = validateBooleanField(suspicious, 'suspicious');

    if (role !== undefined) {
        if (typeof role !== 'string') {
            const error = new Error('Invalid "role" filter, must be a string.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        if (!superuserAllowedRoles.includes(role)) {
            const error = new Error(`Invalid "role" filter, must be one of: ${superuserAllowedRoles.join(', ')}.`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        if (currentUser.role === 'manager' && !managerAllowedRoles.includes(role)) {
            const error = new Error('Forbidden, role must be either "regular" or "cashier".')
            error.code = 'FORBIDDEN';
            throw error;
        }
    }

    // filter out undefined fields
    const updates = Object.fromEntries(
        Object.entries({ email, verified, suspicious, role }).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(updates).length === 0) {
        const error = new Error('No valid fields to update.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    const updatedUser = await repository.updateUser(userId, updates);

    if (!updatedUser) {
        const err = new Error('User not found');
        err.code = 'USER_NOT_FOUND'
        throw err;
    }

    // include some base fields in the response
    const baseFields = ['id', 'utorid', 'name'];

    // in addition, add the fields we used to update
    const allowedKeys = Array.from(new Set([...Object.keys(updates), ...baseFields]));

    // return only the specific keys
    return Object.fromEntries(
        Object.entries(updatedUser).filter(([key]) => allowedKeys.includes(key))
    );
}

async function updateCurrentUser(payload, currentUser) {
    let { name, email, birthday, avatar: avatarUrl } = payload;
    // if null, conver to undefined for each field:
    name = name === null ? undefined : name;
    email = email === null ? undefined : email;
    birthday = birthday === null ? undefined : birthday;
    avatarUrl = avatarUrl === null ? undefined : avatarUrl;

    const userId = currentUser.id;

    // check payload
    if (name !== undefined) {
        if (typeof (name) !== 'string' || name.length < 1 || name.length > 50) {
            const error = new Error('Invalid name, must be 1-50 characters');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    if (email !== undefined) {
        if (typeof (email) !== 'string' || !email.endsWith('utoronto.ca')) {
            const error = new Error('Invalid email, must be a utoronto.ca email.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        const sameEmail = await repository.findUserByEmail(email);
        if (sameEmail && sameEmail.id !== userId) {
            const error = new Error('User with that email already exists.');
            error.code = 'USER_EXISTS';
            throw error;
        }
    }

    if (birthday !== undefined) {
        if (!isValidBirthday(birthday)) {
            const error = new Error('Invalid birthday, must be in YYYY-MM-DD format.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    // avatar check done by multer

    // create updates object and filter out undefined fields
    const updates = Object.fromEntries(
        Object.entries({ name, email, birthday, avatarUrl }).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(updates).length === 0) {
        const error = new Error('No valid fields to update.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    const updatedUser = await repository.updateUser(userId, updates);
    return updatedUser;
}

async function updateCurrentUserPassword({ old, password }, currentUser) {
    if (!old || typeof (old) !== 'string' ||
        !password || typeof (password) !== 'string') {
        // missing required data
        const error = new Error('Missing old/new password');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    if (old !== currentUser.password) {
        const error = new Error('Forbidden: Incorrect old password');
        error.code = 'INVALID_OLD';
        throw error;
    }
    // use a helper function to throw an error if new password is not in valid format
    validatePassword(password);

    // passes all checks, call repo to update password
    const utorid = currentUser.utorid;
    const user = await repository.updatePassword(utorid, password);
    return user;
}

async function createTransfer(payload, currentUser, userId) {
    // check that the currentUser is verified
    if (!currentUser.verified) {
        const error = new Error('Forbidden, logged in user is not verified');
        error.code = 'NOT_VERIFIED';
        throw error;
    }

    let { type, amount, remark } = payload;

    // validated payload data
    if (type !== 'transfer') {
        const error = new Error('Invalid type, must be "transfer"');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    // verify that amount is a positive integer
    amount = validatePositiveNumber(amount, 'amount', true);

    if (remark !== undefined && remark !== null) {
        if (typeof (remark) !== 'string') {
            const error = new Error('Invalid remark, must be a string');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    } else {
        // remark is undefined/null, set it to an empty string instead
        remark = "";
    }

    userId = validatePositiveNumber(userId, 'userId', true);

    // validate that the recipient exists
    const recipient = await repository.getUserById(userId);
    if (!recipient) {
        const error = new Error('Recipient not found"');
        error.code = 'NOT_FOUND';
        throw error;
    }

    // check that the current user has enough to send
    if (currentUser.points < amount) {
        const error = new Error('You do not have sufficient points to send');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // passes all checks, create the transfer
    const deduction = -amount;
    // first the transfer
    const transferDetails = {
        owner: { connect: { id: currentUser.id } },
        // might need to set to minus amount actually, we will see the test cases
        amount: deduction,
        type,
        remark,
        createdBy: currentUser.utorid,
        // for sender, the relatedId is the userId of the recipient
        relatedId: userId
    };

    // then the deposit
    const depositDetails = {
        owner: { connect: { id: userId } },
        amount,
        type,
        remark,
        createdBy: currentUser.utorid,
        // for recipient, the relatedId is the userId of the sender
        relatedId: currentUser.id
    };

    // then create the two transactions
    const transfer = await repository.createTransaction(transferDetails);
    const deposit = await repository.createTransaction(depositDetails);

    // update point balances
    // deduct amount from logged in user
    await repository.updateUserPoints(currentUser.utorid, deduction);

    // add amount to recipient user
    await repository.updateUserPoints(recipient.utorid, amount);

    // create response
    // not sure which id to use, just use the transfer's for now
    const response = {
        id: transfer.id,
        sender: currentUser.utorid,
        recipient: recipient.utorid,
        type,
        sent: amount,
        remark,
        createdBy: currentUser.utorid
    };

    return response;

}

async function createRedemption(payload, currentUser) {
    // check that the currentUser is verified
    if (!currentUser.verified) {
        const error = new Error('Forbidden, logged in user is not verified');
        error.code = 'NOT_VERIFIED';
        throw error;
    }

    let { type, amount, remark } = payload;

    // validated payload data
    if (type !== 'redemption') {
        const error = new Error('Invalid type, must be "redemption"');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    // verify that amount is a positive integer
    amount = validatePositiveNumber(amount, 'amount', true);

    if (remark !== undefined && remark !== null) {
        if (typeof (remark) !== 'string') {
            const error = new Error('Invalid remark, must be a string');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    } else {
        // remark is undefined/null, set it to an empty string instead
        remark = "";
    }

    // check if we have suffient points to redeem
    if (currentUser.points < amount) {
        const error = new Error('You do not have sufficient points to redeem');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // passes all checks, create the transaction
    const deduction = -amount;
    const details = {
        owner: { connect: { id: currentUser.id } },
        amount: deduction,
        type,
        remark,
        createdBy: currentUser.utorid,
        processed: false
    };

    const redemption = await repository.createTransaction(details);

    const response = {
        id: redemption.id,
        utorid: redemption.utorid,
        type: redemption.type,
        processedBy: null,
        amount,
        remark: redemption.remark,
        createdBy: redemption.createdBy
    };

    return response;

}

async function getCurrentUserTransactions(payload, currentUser) {
    // clean the payload and convert null to undefined
    const cleanPayload = Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [key, value === null ? undefined : value])
    );

    let { type, relatedId, promotionId,
        amount, operator, page = 1, limit = 10,
        order, orderBy } = cleanPayload;

    // create filters
    const filters = {};

    // filter by currentUser's owned
    filters.utorid = currentUser.utorid;

    // validate payload data
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

    if (promotionId !== undefined) {
        promotionId = validatePositiveNumber(promotionId, 'promotionId', true);
        filters.promotionId = promotionId;
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
        const sortableFields = ['amount', 'type', 'relatedId', 'remark', 'createdBy'];
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
            amount: t.amount,
            type: t.type,
            spent: t.spent,
            relatedId: t.relatedId,
            promotionIds: t.transactionPromotions.map(tp => tp.promotion.id),
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


module.exports = {
    registerUser, getUsers, getUserById, updateUserStatus, updateCurrentUser,
    updateCurrentUserPassword, createTransfer, createRedemption,
    getCurrentUserTransactions
}