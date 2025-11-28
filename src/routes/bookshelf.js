/**
 * Bookshelf Routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
const bookshelfController = require('../controllers/bookshelfController');

// Get routes
router.get('/index', bookshelfController.getHome);
router.get('/logout', bookshelfController.getLogout);
router.get('/toread', bookshelfController.getToReadShelf);
router.get('/reading', bookshelfController.getReadingShelf);
router.get('/read', bookshelfController.getReadShelf);

// Post routes
router.post('/addtoselector', bookshelfController.postAddBooksToSelector);
router.post('/addbooktoshelf', bookshelfController.postAddBookToBookshelf);

// Delete routes
router.delete('/move', bookshelfController.deleteMoveBook);
router.delete('/move-btn', bookshelfController.deleteMoveBookBtn);
router.delete('/delete', bookshelfController.deleteRemoveBook);
router.delete('/clear', bookshelfController.deleteClearShelf);

module.exports = router;
