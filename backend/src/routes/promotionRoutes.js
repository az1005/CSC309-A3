const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { requireClearance } = require('../middleware/authMiddleware');
const { jwtAuth } = require('../middleware/jwtAuth');

// create a new promotion
router.post('/', jwtAuth, requireClearance('manager'), promotionController.createPromotion);

// get promotion
router.get('/', jwtAuth, promotionController.getPromotions);

// get promotion by id
router.get('/:promotionId', jwtAuth, promotionController.getPromotionById);

// update promotion
router.patch('/:promotionId', jwtAuth, requireClearance('manager'), promotionController.updatePromotion);

// delete a promotion
router.delete('/:promotionId', jwtAuth, requireClearance('manager'), promotionController.deletePromotion);

module.exports = router;