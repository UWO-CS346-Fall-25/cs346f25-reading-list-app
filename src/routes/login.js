/**
 * Index Routes
 *
 * Define routes for the main pages of your application here.
 * Routes connect HTTP requests to controller functions.
 *
 * Example usage:
 * const express = require('express');
 * const router = express.Router();
 * const indexController = require('../controllers/indexController');
 *
 * router.get('/', indexController.getHome);
 * router.get('/about', indexController.getAbout);
 *
 * module.exports = router;
 */

const express = require('express');
const router = express.Router();

// Import controllers
const loginController = require('../controllers/loginController');

// Define routes
router.get('/index', loginController.getHome);

router.get('/register', loginController.getRegister);

router.get('/booklist', loginController.getBooklist);

router.put('/validate_login', loginController.getLogin);

// dummy comment

module.exports = router;
