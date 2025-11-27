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

// Special database routes
router.get('/password', indexController.getPassword); // must exist for password reset redirect to function

// Get routes
router.get('/login', indexController.getLogin);
router.get('/register', indexController.getRegister);
router.get('/bookshelf', indexController.getBookshelf);
router.get('/signout', indexController.getSignout)
router.get('/authors', indexController.getAuthors);
// FOR FUTURE EXPANSION, DO NOT DELETE
// router.get('/genres', indexController.getGenres);
// router.get('/pages', indexController.getPages);
router.get('/trending', indexController.getTrending);
router.get('/filter', indexController.getFilter);

// book routes
router.post('/add', indexController.addBook);
router.post('/addbook', indexController.addBookToBookshelf);

module.exports = router;
