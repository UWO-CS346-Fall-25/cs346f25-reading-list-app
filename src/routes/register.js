/**
 * Index Routes
 */
// const User = require('../models/User');
const express = require('express');
const router = express.Router();

// Import controllers
const registerController = require('../controllers/registerController');

// Define routes
router.get('/index', registerController.getHome);
router.get('/login', registerController.getLogin);
router.get('/bookshelf', registerController.getBookshelf);
router.post('/register', registerController.postRegister);

module.exports = router;
