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
const indexController = require('../controllers/indexController');

// Define routes
// nav bar routes
router.get('/login', indexController.getLogin);
router.get('/register', indexController.getRegister);

// content route
router.get('/authors', indexController.getAuthors);
router.get('/genres', indexController.getGenres);
router.get('/recommended', indexController.getRecommended);

// dummy comment

module.exports = router;
