const authService = require('../services/authService');
const { validatePayload, validatePassword } = require('../util/helpers');

async function generateToken(req, res) {
    try {
        // user helper function to validate payload (detect extra fields)
        // throw an error if there are unwanted extra fields
        const payload = req.body;
        const fields = ['utorid', 'password'];
        validatePayload(payload, fields, fields);
        const { utorid, password } = payload;
        // shouldn't need this check since we do it in validatePayload
        if (!utorid || !password) {
            return res.status(400).json({ error: 'Missing utorid or password' });
        }

        const result = await authService.loginUser(utorid, password);
        res.json(result);
    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 'INVALID_CRED') {
            return res.status(401).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function requestPasswordReset(req, res) {
    try {
        const payload = req.body;
        const fields = ['utorid']
        validatePayload(payload, fields, fields);

        const { utorid } = payload;
        if (!utorid || typeof (utorid) !== 'string') {
            return res.status(400).json({ error: 'Invalid utorid' });
        }
        const result = await authService.requestPasswordReset(utorid);
        return res.status(202).json(result);
    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 'USER_NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function resetPassword(req, res) {
    try {
        const payload = req.body;
        const fields = ['utorid', 'password'];
        validatePayload(payload, fields, fields);

        const { resetToken } = req.params;
        const { utorid, password } = payload;
        // confirm valid format utorid and password
        if (!utorid || typeof (utorid) !== 'string') {
            return res.status(400).json({ error: 'Invalid utorid' });
        }
        // use helper to validate password
        // will throw a 400 error if not valid
        validatePassword(password);

        const result = await authService.resetPassword(utorid, password, resetToken);
        return res.status(200).end();
    } catch (error) {
        if (error.code === 'TOKEN_NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'UTORID_MISMATCH') {
            return res.status(401).json({ error: error.message })
        }
        if (error.code === 'TOKEN_EXPIRED') {
            return res.status(410).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { generateToken, requestPasswordReset, resetPassword };