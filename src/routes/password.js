/**
 * Password Routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
const passwordController = require('../controllers/passwordController');

// Get routes
router.get('/index', passwordController.getHome);

// Post routes
router.post('/reset_password', passwordController.postResetPassword);

module.exports = router;
