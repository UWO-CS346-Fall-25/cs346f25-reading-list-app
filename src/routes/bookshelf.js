/**
 *
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
const booklistController = require('../controllers/booklistController');

// Define routes
router.get('/bookshelf', booklistController.getHome);

router.get('/login', booklistController.getLogin);

// dummy comment

module.exports = router;
