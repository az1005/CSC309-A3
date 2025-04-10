const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireClearance } = require('../middleware/authMiddleware');
const { jwtAuth } = require('../middleware/jwtAuth');
const { upload } = require('../middleware/multerConfig');

// only users with clearance cashier or higher can register a new user
// currently logged in user also must be authenticated
// look into changing with express-jwt
router.post('/', jwtAuth, requireClearance('cashier'), userController.registerUser);

router.get('/', jwtAuth, requireClearance('manager'), userController.getUsers);

router.patch('/me', jwtAuth, upload.single('avatar'), userController.updateCurrentUser)

router.get('/me', jwtAuth, userController.getCurrentUser)

router.patch('/me/password', jwtAuth, userController.updateCurrentUserPassword)

// create a redemption transaction
router.post('/me/transactions', jwtAuth, userController.createRedemption);

// get all transactions from logged in user
router.get('/me/transactions', jwtAuth, userController.getCurrentUserTransactions);

// create transfer transaction between logged in user (sender) to userId
router.post('/:userId/transactions', jwtAuth, userController.createTransfer);

router.get('/:userId', jwtAuth, requireClearance('regular'), userController.getUserById);

router.patch('/:userId', jwtAuth, requireClearance('manager'), userController.updateUserStatus);

module.exports = router;