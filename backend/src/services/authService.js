const jwt = require('jsonwebtoken');
const repository = require('../repositories/repository');
const { generateResetTokenUUID, getExpiryDate } = require('../util/helpers');

const SECRET_KEY = process.env.JWT_SECRET || 'secret-key';

async function loginUser(utorid, password) {
    // fetch user
    let user = await repository.findUserByUtorid(utorid);

    
    // confirm information
    if (!user) {
        const error = new Error('Invalid credentials');
        error.code = "INVALID_CRED";
        throw error;
    } else if (user.password !== password) {
        const error = new Error('Invalid credentials');
        error.code = "INVALID_CRED";
        throw error;
    }
    
    // update the user's lastLogin time
    user = await repository.updateLastLogin(utorid);


    // valid info, sign a jwt token with payload including user's id in db
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    const expiresAt = getExpiryDate(1);

    return { token, expiresAt };
}

async function requestPasswordReset(utorid) {
    // fetch user
    const user = await repository.findUserByUtorid(utorid);
    if (!user) {
        const err = new Error('User not found');
        err.code = 'USER_NOT_FOUND'
        throw err;
    }

    // generate reset token and expiry date 
    // (1 hour for password resets)
    const resetToken = generateResetTokenUUID();
    const expiresAt = getExpiryDate(1);

    // need to invalidate all other resetTokens for this user
    await repository.invalidateAllResetTokens(user.id);

    // create a new reset token and link it to this user
    const token = await repository.createResetToken(user.id, resetToken, expiresAt);
    return { resetToken, expiresAt };
}

async function resetPassword(utorid, password, resetToken) {
    const token = await repository.getResetToken(resetToken);
    // check if token was found
    if (!token) {
        const err = new Error('Token not found');
        err.code = 'TOKEN_NOT_FOUND';
        throw err;
    }
    // if token does not match utorid, return unauthorized
    if (token.user.utorid !== utorid) {
        const err = new Error('Unauthorized: utorid mismatch');
        err.code = 'UTORID_MISMATCH';
        throw err;
    }
    // check if this is an old token or expired
    if (token.isExpired || token.expiresAt < Date.now()) {
        const err = new Error('Token expired');
        err.code = 'TOKEN_EXPIRED';
        throw err;
    }

    // passes all tests, update password
    const updatedUser = await repository.updatePassword(utorid, password);
    return updatedUser;

    // may want to delete the token later

}

module.exports = { loginUser, requestPasswordReset, resetPassword };