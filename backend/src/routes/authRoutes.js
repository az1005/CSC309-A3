const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { rateLimiter } = require('../middleware/authMiddleware');

// authenticate a user and generate a JWT token
router.post('/tokens', authController.generateToken);

// request a password reset
// use the rateLimiter middleware to prevent multiple posts from the same IP
// within 60 seconds
router.post('/resets', rateLimiter, authController.requestPasswordReset);

// reset password given a resetToken
router.post('/resets/:resetToken', authController.resetPassword);

module.exports = router;