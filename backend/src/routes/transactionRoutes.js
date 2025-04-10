const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { requireClearance } = require('../middleware/authMiddleware');
const { jwtAuth } = require('../middleware/jwtAuth');

// create a transaction
router.post('/', jwtAuth, requireClearance('cashier'), transactionController.createTransaction);

// get transactions
router.get('/', jwtAuth, requireClearance('manager'), transactionController.getTransactions);

// set/unset a transaction as suspicious
router.patch('/:transactionId/suspicious', jwtAuth, requireClearance('manager'), transactionController.updateTransactionSuspicious);

// process a redemption transaction
router.patch('/:transactionId/processed', jwtAuth, requireClearance('cashier'), transactionController.processRedemption);

// get transaction by id
router.get('/:transactionId', jwtAuth, requireClearance('regular'), transactionController.getTransactionById);

module.exports = router;