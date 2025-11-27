/**
 * Reset Routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
const resetController = require('../controllers/resetController');

// Get routes
router.get('/index', resetController.getHome);
router.get('/login', resetController.getLogin);
router.get('/register', resetController.getRegister);

// Post routes
router.post('/password_reset', resetController.postPasswordReset);

module.exports = router;
