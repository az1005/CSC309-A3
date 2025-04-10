const userService = require('../services/userService');
const { validatePayload } = require('../util/helpers');

async function registerUser(req, res) {
    try {
        // get payload from request body
        const payload = req.body;
        const fields = ['utorid', 'name', 'email'];
        validatePayload(payload, fields, fields);

        const { newUser, resetToken, expiresAt } = await userService.registerUser(payload);

        // filter and only choose the wanted fields
        const filteredUser = {
            id: newUser.id,
            utorid: newUser.utorid,
            name: newUser.name,
            email: newUser.email,
            verified: newUser.verified,
            resetToken,
            expiresAt
        }

        res.status(201).json(filteredUser);
    } catch (error) {
        if (error.code === 'USER_EXISTS') {
            return res.status(409).json({ error: error.message })
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getUsers(req, res) {
    try {
        // retrieve information from request
        // for get requests, the payload is in the request's query
        const payload = req.query;
        validatePayload(payload, ['name', 'role', 'verified',
            'activated', 'page', 'limit', 'order', 'orderBy'], []);

        const { count, results } = await userService.getUsers(payload);

        // apply filtering to hide sensitive and other information
        const safeResults = results.map(user => {
            const filteredUser = {
                id: user.id,
                utorid: user.utorid,
                name: user.name,
                email: user.email,
                birthday: user.birthday,
                role: user.role,
                points: user.points,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                verified: user.verified,
                avatarUrl: user.avatarUrl
            }
            return filteredUser;
        });

        return res.status(200).json({ count, results: safeResults });

    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getUserById(req, res) {
    try {
        // req.body should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        // retrieve userId param and currentUser to filter results
        const { userId } = req.params;
        const currentUser = req.user;
        const { user, promos } = await userService.getUserById(userId, currentUser);

        const now = new Date();
        let filteredUser;

        // assume service filters out the correct promotions to show
        if (currentUser.role === 'manager' || currentUser.role === 'superuser') {
            filteredUser = {
                id: user.id,
                utorid: user.utorid,
                name: user.name,
                email: user.email,
                birthday: user.birthday,
                role: user.role,
                suspicious: user.suspicious,
                points: user.points,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                verified: user.verified,
                avatarUrl: user.avatarUrl,
                promotions: promos
            };
        } else {
            // currentUser.role must be 'cashier', 
            // since we passed the jwtAuth and requireClearance
            filteredUser = {
                id: user.id,
                utorid: user.utorid,
                name: user.name,
                points: user.points,
                verified: user.verified,
                promotions: promos
            };
        }

        return res.status(200).json(filteredUser);

    } catch (error) {
        if (error.code === 'USER_NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateUserStatus(req, res) {
    try {
        // retrieve userId param and currentUser to filter results
        const { userId } = req.params;
        const payload = req.body;
        validatePayload(payload, ['email', 'verified', 'suspicious', 'role'], []);
        const currentUser = req.user;

        const updatedUser = await userService.updateUserStatus(payload, currentUser, userId);

        return res.status(200).json(updatedUser);

    } catch (error) {
        if (error.code === 'USER_EXISTS') {
            return res.status(409).json({ error: error.message })
        }
        if (error.code === 'USER_NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'FORBIDDEN') {
            return res.status(403).json({ error: error.message })
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateCurrentUser(req, res) {
    try {
        const payload = {
            ...req.body,
            avatar: req.file ? `/uploads/avatars/${req.file.filename}` : undefined
        };
        validatePayload(payload, ['name', 'email', 'birthday', 'avatar'], []);
        const currentUser = req.user;

        const updatedUser = await userService.updateCurrentUser(payload, currentUser);

        // shouldn't get this error
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const filteredUser = {
            id: updatedUser.id,
            utorid: updatedUser.utorid,
            name: updatedUser.name,
            email: updatedUser.email,
            birthday: updatedUser.birthday,
            role: updatedUser.role,
            points: updatedUser.points,
            createdAt: updatedUser.createdAt,
            lastLogin: updatedUser.lastLogin,
            verified: updatedUser.verified,
            avatarUrl: updatedUser.avatarUrl
        }

        return res.status(200).json(filteredUser);

    } catch (error) {
        if (error.code === 'USER_EXISTS') {
            return res.status(409).json({ error: error.message })
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getCurrentUser(req, res) {
    try {
        // payload should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        // retrieve currentUser's id from auth middleware
        const userId = req.user.id;
        const currentUser = req.user;
        const { user, promos } = await userService.getUserById(userId, currentUser);

        // shouldn't get this error
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const filteredUser = {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            birthday: user.birthday,
            role: user.role,
            points: user.points,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            verified: user.verified,
            avatarUrl: user.avatarUrl,
            promotions: promos,
            transactions: user.transactions,
            eventsAsGuest: user.eventsAsGuest,
            eventsAsOrganizer: user.eventsAsOrganizer
        }

        return res.status(200).json(filteredUser);
    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message })
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateCurrentUserPassword(req, res) {
    try {
        const payload = req.body;
        const fields = ['old', 'new'];
        validatePayload(payload, fields, fields);

        const { old, new: password } = payload;
        const currentUser = req.user;

        const user = await userService.updateCurrentUserPassword({ old, password }, currentUser);
        // shouldn't get this error
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).end();
    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message })
        }
        if (error.code === 'INVALID_OLD') {
            return res.status(403).json({ error: error.message })
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function createTransfer(req, res) {
    try {
        const payload = req.body;
        const allowedFields = ['type', 'amount', 'remark'];
        const requiredFields = ['type', 'amount'];
        validatePayload(payload, allowedFields, requiredFields);

        const currentUser = req.user;
        const { userId } = req.params;

        // assume service will filter the correct fields
        const transfer = await userService.createTransfer(payload, currentUser, userId);

        return res.status(201).json(transfer);

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message })
        }
        if (error.code === 'NOT_VERIFIED') {
            return res.status(403).json({ error: error.message })
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message })
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function createRedemption(req, res) {
    try {
        const payload = req.body;
        const allowedFields = ['type', 'amount', 'remark'];
        const requiredFields = ['type', 'amount'];
        validatePayload(payload, allowedFields, requiredFields);

        const currentUser = req.user;

        // assume service will filter the correct fields
        const redemption = await userService.createRedemption(payload, currentUser);

        return res.status(201).json(redemption);

    } catch (error) {
        if (error.code === 'NOT_VERIFIED') {
            return res.status(403).json({ error: error.message })
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message })
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getCurrentUserTransactions(req, res) {
    try {
        // payload in query for get
        const payload = req.query;
        const allowedFields = ['type', 'relatedId', 'promotionId',
            'amount', 'operator', 'page', 'limit', 'order', 'orderBy'];
        validatePayload(payload, allowedFields, []);

        const currentUser = req.user;

        // assume results fields has been properly filtered
        const { count, results } = await userService.getCurrentUserTransactions(payload, currentUser);
        return res.status(200).json({ count, results });

    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    registerUser, getUsers, getUserById, updateUserStatus, updateCurrentUser,
    getCurrentUser, updateCurrentUserPassword, createTransfer, createRedemption,
    getCurrentUserTransactions
}