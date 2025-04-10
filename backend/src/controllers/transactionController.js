const transactionService = require('../services/transactionService');
const { validatePayload } = require('../util/helpers');

async function createTransaction(req, res) {
    try {
        const payload = req.body;
        const currentUser = req.user;
        // determine if this is a purchase or adjustment transaction
        const { type } = payload;
        if (type !== undefined && typeof (type) !== 'string') {
            const error = new Error("Invalid type, must be a string.");
            error.code = 'BAD_PAYLOAD';
            throw error;
        }

        let allowedFields;
        let requiredFields;
        let transaction;

        if (type === 'purchase') {
            allowedFields = ['utorid', 'type', 'spent', 'promotionIds', 'remark'];
            requiredFields = ['utorid', 'type', 'spent'];
            validatePayload(payload, allowedFields, requiredFields);
            transaction = await transactionService.createPurchase(payload, currentUser);
        } else if (type === 'adjustment') {
            allowedFields = ['utorid', 'type', 'amount', 'relatedId', 'promotionIds', 'remark'];
            requiredFields = ['utorid', 'type', 'amount', 'relatedId'];
            validatePayload(payload, allowedFields, requiredFields);
            transaction = await transactionService.createAdjustment(payload, currentUser);
        } else {
            const error = new Error("Invalid type, must be either 'purchase' or 'adjustment'.");
            error.code = 'BAD_PAYLOAD';
            throw error;
        }

        return res.status(201).json(transaction);

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'FORBIDDEN') {
            return res.status(403).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getTransactions(req, res) {
    try {
        // payload in query for get
        const payload = req.query;
        const allowedFields = ['name', 'createdBy', 'suspicious', 'promotionId',
            'type', 'relatedId', 'amount', 'operator',
            'page', 'limit', 'order', 'orderBy'];
        validatePayload(payload, allowedFields, []);

        // assume results fields has been properly filtered
        const { count, results } = await transactionService.getTransactions(payload);
        return res.status(200).json({ count, results });

    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getTransactionById(req, res) {
    try {
        // payload should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        const { transactionId } = req.params;

        const transaction = await transactionService.getTransactionById(transactionId);

        return res.status(200).json(transaction);

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateTransactionSuspicious(req, res) {
    try {
        const payload = req.body;
        validatePayload(payload, ['suspicious'], ['suspicious']);

        const { transactionId } = req.params;

        const transaction = await transactionService.updateTransactionSuspicious(payload, transactionId);

        return res.status(200).json(transaction);
    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function processRedemption(req, res) {
    try {
        const payload = req.body;
        validatePayload(payload, ['processed'], ['processed']);

        const { transactionId } = req.params;
        const currentUser = req.user;

        const redemption = await transactionService.processRedemption(payload, transactionId, currentUser);

        return res.status(200).json(redemption);
    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}



module.exports = {
    createTransaction, getTransactions, getTransactionById,
    updateTransactionSuspicious, processRedemption
};