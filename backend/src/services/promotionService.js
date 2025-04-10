const repository = require('../repositories/repository');
const { validateStartAndEndTimes, validatePositiveNumber, validateBooleanField, isValidISO8601 } = require('../util/helpers');

async function createPromotion(payload) {
    let { name, description, type, startTime,
        endTime, minSpending, rate, points } = payload;

    const details = {};

    // validate payload data
    if (!name || typeof (name) !== 'string') {
        const error = new Error('Invalid name, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (!description || typeof (description) !== 'string') {
        const error = new Error('Invalid description, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (!type || typeof (type) !== 'string' ||
        !(type === 'automatic' || type === 'one-time')) {
        const error = new Error('Invalid type, must be either "automatic" or "one-time".');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    // use helper function to throw bad payload errors if promotion times are not valid
    validateStartAndEndTimes(startTime, endTime);

    details.name = name;
    details.description = description;
    details.type = type;
    details.startTime = startTime;
    details.endTime = endTime;

    // if the optional number fields are specified, use a helper function
    // and throw an error if they are invalid
    // otherwise, set the variables as their numeric values
    if (minSpending) {
        minSpending = validatePositiveNumber(minSpending, 'minSpending');
        details.minSpending = minSpending;
    }
    if (rate) {
        rate = validatePositiveNumber(rate, 'rate');
        details.rate = rate;
    }
    if (points) {
        points = validatePositiveNumber(points, 'points', true);
        details.points = points;
    }

    const promo = await repository.createPromotion(details);
    return promo;
}

async function getPromotions(payload, currentUser) {
    let { name, type, page = 1, limit = 10, started, ended, order, orderBy } = payload;

    // validate payload data
    if (name !== undefined && typeof (name) !== 'string') {
        const error = new Error('Invalid name, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (type !== undefined && (typeof (type) !== 'string' ||
        !(type === 'automatic' || type === 'one-time'))) {
        const error = new Error('Invalid type, must be either "automatic" or "one-time".');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // build query filter
    const filters = {}
    if (name) filters.name = name;
    if (type) filters.type = type;
    const now = new Date();

    page = validatePositiveNumber(page, 'page', true);
    limit = validatePositiveNumber(limit, 'limit', true);

    if (started !== undefined && ended !== undefined) {
        // should not have both of these defined
        const error = new Error('Both started and ended should not be specified');
        error.code = 'BAD_PAYLOAD';
        throw error;
    } else if (started !== undefined) {
        started = validateBooleanField(started, 'started');
        // if started, we want to filter by start time that is less than currently
        filters.startTime = started ? { lte: now } : { gt: now };
    } else if (ended !== undefined) {
        ended = validateBooleanField(ended, 'ended');
        filters.endTime = ended ? { lte: now } : { gt: now };
    } else {
        // both are undefined. 
        // if current user is a regular, we should only show active promos: 
        // startTime is less than now, endTime is greater
        if (currentUser.role === 'regular' || currentUser.role === 'cashier') {
            filters.startTime = { lte: now };
            filters.endTime = { gt: now };
        }
    }

    // validate order and orderBy
    order = order !== null ? order : undefined
    orderBy = orderBy !== null ? orderBy : undefined
    if (order !== undefined && orderBy !== undefined) {
        const sortableFields = ['name', 'type', 'endTime', 'minSpending', 'rate', 'points', 'startTime'];
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

    const { count, results } = await repository.getPromotionsWithFilters(filters, skip, limit, sortOptions);

    return { count, results };
}

async function getPromotionById(promoId, currentUser) {
    // validate promoId as an positive integer
    promoId = validatePositiveNumber(promoId, 'promotionId', true);

    const promo = await repository.getPromotionById(promoId);
    if (!promo) {
        const error = new Error('Promotion not found');
        error.code = 'NOT_FOUND';
        throw error;
    }

    // if current user is a regular/cashier, only show the promo if it is active
    // dont show if active => dont show if start in future or end already
    const now = new Date();
    if ((currentUser.role === 'regular' || currentUser.role === 'cashier') &&
        (promo.startTime > now || promo.endTime < now)) {
        const error = new Error('Could not find active promotion');
        error.code = 'NOT_FOUND';
        throw error;
    }
    return promo;
}

async function updatePromotion(payload, promoId) {
    // clean the payload and convert null to undefined
    const cleanPayload = Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [key, value === null ? undefined : value])
    );

    let { name, description, type, startTime,
        endTime, minSpending, rate, points } = cleanPayload;

    promoId = validatePositiveNumber(promoId, 'promotionId', true);

    // find the original promo to check if it exists and if has started already
    const originalPromo = await repository.getPromotionById(promoId);
    if (!originalPromo) {
        const error = new Error('Promotion not found');
        error.code = 'NOT_FOUND';
        throw error;
    }

    const now = new Date();

    if (originalPromo.startTime < now) {
        const fields = [name, description, type, startTime, minSpending, rate, points];
        if (fields.some(field => field !== undefined)) {
            // cannot change any of these fields if promo has started
            const error = new Error('Promo has already started');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }
    if (originalPromo.endTime < now) {
        const fields = [name, description, type, startTime, endTime, minSpending, rate, points];
        if (fields.some(field => field !== undefined)) {
            // cannot change any of these fields if promo has ended
            const error = new Error('Promo has already ended');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    // validate payload data
    if (name !== undefined && typeof (name) !== 'string') {
        const error = new Error('Invalid name, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (description !== undefined && typeof (description) !== 'string') {
        const error = new Error('Invalid description, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (type !== undefined && (typeof (type) !== 'string' ||
        !(type === 'automatic' || type === 'one-time'))) {
        const error = new Error('Invalid type, must be either "automatic" or "one-time".');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    // validate start and end times
    if (startTime !== undefined && endTime !== undefined) {
        validateStartAndEndTimes(startTime, endTime);
    } else if (startTime !== undefined) {
        if (typeof (startTime) !== 'string' ||
            !isValidISO8601(startTime)) {
            const error = new Error('Invalid startTime format, must be a ISO 8601 string.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        const start = new Date(startTime);
        if (start < now) {
            const error = new Error('Invalid startTime, cannot be in the past.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        if (start > originalPromo.endTime) {
            const error = new Error('Invalid startTime, must be before the end time.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    } else if (endTime !== undefined) {
        if (typeof (endTime) !== 'string' ||
            !isValidISO8601(endTime)) {
            const error = new Error('Invalid endTime format, must be a ISO 8601 string representing a date in the future.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        const end = new Date(endTime);
        if (end < now) {
            const error = new Error('Invalid endTime, cannot be in the past.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        if (end < originalPromo.startTime) {
            const error = new Error('Invalid endTime, must be after the start time.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    if (minSpending !== undefined && minSpending !== null) {
        minSpending = validatePositiveNumber(minSpending, 'minSpending');
    }
    if (rate !== undefined && rate !== null) {
        rate = validatePositiveNumber(rate, 'rate');
    }
    if (points !== undefined && points !== null) {
        points = validatePositiveNumber(points, 'points', true);
    }

    // passes all checks, update the promo
    // filter out undefined fields
    const updates = Object.fromEntries(
        Object.entries({
            name, description, type, startTime,
            endTime, minSpending, rate, points
        }).filter(([_, v]) => v !== undefined && v !== null)
    );

    if (Object.keys(updates).length === 0) {
        const error = new Error('No valid fields to update.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    const updatedPromo = await repository.updatePromotion(promoId, updates);

    // shouldn't happen since it was found earlier
    if (!updatedPromo) {
        const error = new Error('Promotion not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // include some base fields in the response
    const baseFields = ['id', 'name', 'type'];

    // in addition, add the fields we used to update
    const allowedKeys = Array.from(new Set([...Object.keys(updates), ...baseFields]));

    // return only the specific keys
    return Object.fromEntries(
        Object.entries(updatedPromo).filter(([key]) => allowedKeys.includes(key))
    );
}

async function deletePromotion(promoId) {
    promoId = validatePositiveNumber(promoId, 'promotionId', true);

    // make sure the promo hasn't started yet
    const promo = await repository.getPromotionById(promoId);
    if (!promo) {
        const error = new Error('Promotion not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    const now = new Date();
    if (promo.startTime < now) {
        const error = new Error('Promotion already started, cannot delete');
        error.code = 'ALREADY_STARTED'
        throw error;
    }

    await repository.deletePromotion(promoId);
    return;
}

module.exports = {
    createPromotion, getPromotions, getPromotionById, updatePromotion, deletePromotion
}