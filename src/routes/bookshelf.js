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
const bookshelfController = require('../controllers/bookshelfController');

// Define routes
router.get('/home', bookshelfController.getHome);
router.get('/bookshelf', bookshelfController.getHome);
router.get('/logout', bookshelfController.logout);

router.post('/bookshelf/add', bookshelfController.postAddBook);
router.post('/bookshelf/delete', bookshelfController.postDeleteBook);

// dummy comment
module.exports = router;
