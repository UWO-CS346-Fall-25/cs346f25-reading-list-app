/**
 * Login Routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
const loginController = require('../controllers/loginController');

// Get routes
router.get('/index', loginController.getHome);
router.get('/register', loginController.getRegister);
router.get('/reset', loginController.getReset);

// Post routes
router.post('/user_login', loginController.postLogin);

module.exports = router;
