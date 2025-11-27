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
router.get('/index', indexController.getHome);
router.get('/login', indexController.getLogin);
router.get('/register', indexController.getRegister);
router.get('/bookshelf', indexController.getBookshelf);
router.get('/signout', indexController.signOut)
router.get('/authors', indexController.getAuthors);
router.get('/genres', indexController.getGenres);
router.get('/pages', indexController.getPages);
router.get('/recommended', indexController.getRecommended);
router.get('/filter', indexController.getFilter);

// book routes
router.post('/add', indexController.addBook);
router.post('/addbook', indexController.addBookToBookshelf);

// dummy comment

module.exports = router;
