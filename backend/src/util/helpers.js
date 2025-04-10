const { v4: uuidv4 } = require('uuid');

function generateResetTokenUUID() {
    return uuidv4();
}

function getExpiryDate(hours) {
    // set reset token's expiration in 1 hour
    const now = new Date();
    now.setHours(now.getHours() + hours);
    return now;
}

function isValidBirthday(birthday) {
    if (typeof birthday !== 'string') return false;

    // matches YYYY-MM-DD format
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!dateRegex.test(birthday)) return false;

    // check if the date is a real date
    const date = new Date(birthday);
    const [year, month, day] = birthday.split('-').map(Number);

    return date.getUTCFullYear() === year &&
        date.getUTCMonth() + 1 === month &&
        date.getUTCDate() === day;
}

function validatePayload(payload, allowedKeys, requiredKeys) {
    // allowedKeys is an array of keys that are allowed for this payload
    // detect if there are any extra keys unaccounted for and throw an error
    const extraKeys = Object.keys(payload).filter(key => !allowedKeys.includes(key));
    if (extraKeys.length > 0) {
        const error = new Error(`Unexpected fields: ${extraKeys.join(', ')}`);
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    // requiredKeys is an array of keys that are required for this payload
    // detect if there are any missing keys
    const missingKeys = requiredKeys.filter(key => !(key in payload));
    if (missingKeys.length > 0) {
        const error = new Error(`Missing fields: ${missingKeys.join(', ')}`);
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
}

function validateBooleanField(value, fieldName) {
    // test is value is a valid boolean field, convert to a boolean if required
    if (value === undefined) return undefined;

    if (typeof value === 'string') {
        if (value !== 'true' && value !== 'false') {
            const error = new Error(`Invalid "${fieldName}" filter, must be "true" or "false".`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        return value === 'true';
    }

    if (typeof value !== 'boolean') {
        const error = new Error(`Invalid "${fieldName}" filter, must be a boolean.`);
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    return value;
}

function validatePassword(password) {
    // password needs to be between 8-20 characters, with at least one of each:
    // uppercase letter, lowercase letter, number, special character
    if (!password ||
        typeof (password) !== 'string' ||
        password.length < 8 ||
        password.length > 20 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^a-zA-Z0-9]/.test(password)
    ) {
        const error = new Error('Invalid password format')
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
}

function isValidISO8601(dateStr) {
    // this regex matches an ISO 8601 string with optional fractional seconds 
    // and a timezone offset (either "Z" or +HH:MM / -HH:MM)
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!isoRegex.test(dateStr)) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

function validateStartAndEndTimes(startTime, endTime) {
    if (typeof (startTime) !== 'string' || !isValidISO8601(startTime)) {
        const error = new Error('Invalid startTime format, must be a ISO 8601 string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (typeof (endTime) !== 'string' || !isValidISO8601(endTime)) {
        const error = new Error('Invalid endTime format, must be a ISO 8601 string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // to account for the small 4 millisecond difference between start time and now
    // in one of the test cases, try allowing a 50 milliseconds tolerance
    const tolerance = 50;

    if (start.getTime() < now.getTime() - tolerance) {
        const error = new Error('Invalid startTime, must not be in the past.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (end <= start) {
        const error = new Error('Invalid endTime, must be after startTime.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
}

function validatePositiveNumber(value, fieldName, integer = false) {
    if (!integer) {
        value = parseFloat(value);
        if (isNaN(value) || value < 0) {
            const error = new Error(`Invalid ${fieldName} value, must be a postive number.`)
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        return value;
    } else {
        const floatValue = parseFloat(value);
        const intValue = parseInt(value, 10);
        if (isNaN(intValue) || intValue < 0 || floatValue !== intValue) {
            const error = new Error(`Invalid ${fieldName} value, must be a postive integer.`)
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        return intValue;
    }
}

function validateIdArray(ids, fieldName, integer = false) {
    if (!Array.isArray(ids)) {
        const error = new Error(`Invalid ${fieldName} array, must be an array.`);
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    return ids.map(id => validatePositiveNumber(id, fieldName, integer));
}

module.exports = {
    generateResetTokenUUID, getExpiryDate, isValidBirthday, validatePayload,
    validateBooleanField, validatePassword, isValidISO8601, validateStartAndEndTimes,
    validatePositiveNumber, validateIdArray
};