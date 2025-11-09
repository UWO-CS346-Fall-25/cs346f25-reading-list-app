/**
 * Index Controller
 *
 * Controllers handle the business logic for routes.
 * They process requests, interact with models, and send responses.
 *
 * Best practices:
 * - Keep controllers focused on request/response handling
 * - Move complex business logic to separate service files
 * - Use models to interact with the database
 * - Handle errors appropriately
 */

// Import models if needed
// const SomeModel = require('../models/SomeModel');

/**
 * GET /
 * Display the home page with the user's books
 */
exports.getHome = async (req, res, next) => {
  try {

    let books = {
      'to-read': [],
      'reading': [],
      'read': []
    };

    //Verify user id
    const userId = req.session.user ? req.session.user.id : null;

    if(userId) { //call getBooks to fetch the books from the database
      books = await Book.getBooks(userId);
    }
    
    res.render('index', {
      title: 'Bookshelf',
      csrfToken: req.csrfToken(),
      books: books, //Pass the books and user info into the bookshelf.ejs view
      user: req.session.user || null
    });
  } catch (error) {
    next(error);
  }
};


const Book = require('../models/Book');

/**
 * 
 * Gets the book from the add book button
 * @returns 
 */
exports.postAddBook = async (req, res, next) => {
  try {

    const { title, author, status } = req.body;

    //Verify user id
    const userId = req.session.user ? req.session.user.id : null;

    if(!userId) {
      return res.status(401).json({success: false, message: 'User not logged in.'});
    }

    const newBook = await Book.addBook({
      title, 
      author,
      status,
      userId
    });

    res.status(201).json({success: true, book: newBook});

  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
}

/**
 * Handle book deletion
 */
exports.postDeleteBook = async (req, res, next) => {
  try {
    const { bookId, status } = req.body;

    const userId = req.session.user ? req.session.user.id : null;

    if(!userId) {
      return res.status(401).json({success: false, message: 'User not logged in.'});
    }

    await Book.deleteBook({
      bookId, status, userId
    });

    res.status(200).json({success: true, message: 'Book successfully deleted!'});

  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
}




/**
 * GET /logout
 * Display the home page with cleared session
 */
exports.logout = async (req, res, next) => {
  try {
    const token = req.csrfToken();
    req.session.destroy(error => {
      if (error) {
        next(error);
      }
      res.clearCookie('connect.sid');
      res.render('index', {
        title: 'Bookshelf',
        csrfToken: token,
        user: null, //reassign user to null and clear the columns
        books: {'to-read': [], 'reading': [], 'read': [] }
      });
    });
  } catch (error) {
    next(error);
  }
};
