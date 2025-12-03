/**
 * Index Routes
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
router.get('/signout', indexController.getSignout);
router.get('/authors', indexController.getAuthors);
router.get('/pages', indexController.getPages);
router.get('/trending', indexController.getTrending);
router.get('/filter', indexController.getFilter);

// Post routes
router.post('/selector', indexController.postAddBookToSelector);
router.post('/add_to_shelf', indexController.postAddBookToBookshelf);

module.exports = router;
