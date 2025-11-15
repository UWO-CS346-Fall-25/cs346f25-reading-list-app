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
const User = require('../models/User');

/**
 * GET /
 * Display the home page with the user's books
 */
exports.getHome = async (req, res, next) => {
  try {
    res.render('index', {
      title: 'Bookshelf',
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    next(error);
  }
};

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

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not logged in.' });
    }
    res.status(201).json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

exports.addBook = async (req, res) => {
  try {
    const { author, title, bookshelfTable } = req.body;
    const userId = req.session.user.sub;
    const result = await User.addBook(author, title, bookshelfTable, userId);
    if (result) { // addition worked
      res.status(201).json({ success: true });
    }
    else { // addition failed
      res.status(409).json({ success: false });
    }
  } catch (error) { // network error
    res.status(500).json({ success: false });
  }
}

/**
 * Handle book deletion
 */
exports.postDeleteBook = async (req, res) => {
  // try {
  //   const { bookId, status } = req.body;

  //   const userId = req.session.user.user.id ? req.session.user.user.id : null;

  //   if(!userId) {
  //     return res.status(401).json({success: false, message: 'User not logged in.'});
  //   }

  //   await Book.deleteBook({
  //     bookId, status, userId
  //   });

  //   res.status(200).json({success: true, message: 'Book successfully deleted!'});

  // } catch (error) {
  //   res.status(500).json({success: false, message: error.message});
  // }
}

/**
 * GET /logout
 * Display the home page with cleared session
 */
exports.logout = async (req, res, next) => {
  try {
    req.session.destroy(error => {
      if (error) {
        next(error);
      }
      res.clearCookie('connect.sid');
      res.render('index', {
        title: 'Bookshelf',
        csrfToken: req.csrfToken(),
        user: null, //reassign user to null and clear the columns
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /
 * Adds a book to the select book window
 */
exports.addBooksToSelector = async (req, res) => {
  try {
    const result = await User.getBookList(req.body.title, req.body.author);
    if (result.ok) {
      const books = await result.json();
      let bookList = [];
      for (const book of books.docs) {
        let coverURL = null;
        if (book.cover_i) {
          coverURL = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
        } else if (book.cover_edition_key) {
          coverURL = `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-L.jpg`;
        } else if (book.ocaid) {
          coverURL = `https://archive.org/services/img/${book.ocaid}`;
        } else {
          coverURL = '/images/broken_image.png';
        }
        let displayBook = {
          title: book.title,
          authors: book.author_name,
          cover: coverURL,
        };
        bookList.push(displayBook);
      }
      res.status(201).json({ success: true, data: bookList });
    } else {
      res.status(404).json({ success: false, message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /
 * Adds a book to the users to-read bookshelf
 */
exports.addBookToBookshelf = async (req, res) => {
  if (req.session.user) { // checking to make sure the user is logged in
    try { // trying to insert the book
      const result = await User.addBook(
        req.body.title,
        req.body.authors,
        req.body.table,
        req.session.user.sub
      );
      if (result) { // insert worked
        res.status(201).json({ success: true, data: result });
      } else { // book already exists in the table
        res.status(409).json({ success: false });
      }
    } catch (error) { // network error
      res.status(500).json({ success: false });
    }
  }
  else { // user is no longer logged in
    res.status(403).json({ success: false });
  }
};

/**
 * GET /
 * Gets the books in a user's to-read shelf
 */
exports.getToReadShelf = async (req, res) => {
  try { // getting to-read list
    const result = await User.getToRead(req.session.user.sub);
    res.status(201).json({ success: true, data: result });
  }
  catch (error) { // setting status if database connection didn't work
    res.status(500).json({ success: false });
  }
}

/**
 * GET /
 * Gets the books in a user's reading shelf
 */
exports.getReadingShelf = async (req, res) => {
  try { // getting reading list
    const result = await User.getReading(req.session.user.sub);
    res.status(201).json({ success: true, data: result });
  }
  catch (error) { // setting status if database connection didn't work
    res.status(500).json({ success: false });
  }
}

/**
 * GET /
 * Gets the books in a user's read shelf
 */
exports.getReadShelf = async (req, res) => {
  try { // getting read list
    const result = await User.getRead(req.session.user.sub);
    res.status(201).json({ success: true, data: result });
  }
  catch (error) { // setting status if database connection didn't work
    res.status(500).json({ success: false });
  }
}

/**
 * DELETE /
 * Moves a book from one shelf to another
 */
exports.moveBook = async (req, res) => {
  let result = await User.moveBook(req.body.book_id, req.body.start, req.body.end, req.session.user.sub);
  if (result === null) { // the insert worked, but the delete failed
    res.status(409).json({ success: false });
  }
  else if (result) { // the insert and the delete failed
    res.status(201).json({ success: true });
  }
  else { // the initial select failed, or the insert failed
    res.status(500).json({ success: false });
  }
}

/**
 * DELETE /
 * Removes a book from the requested shelf
 */
exports.removeBook = async (req, res) => {
  try { // attempt to delete a book
    let result = await User.removeBook(req.body.book_id, req.body.bookshelf);
    res.status(201).json({ success: true });
  }
  catch (error) { // network error
    res.status(500).json({ success: false });
  }
}

exports.clearShelf = async (req, res) => {
  try { //if the user is logged in, get the bookshelf they're targeting, their id, and perform the clear
    if (!req.session.user) {
      const { bookshelf } = req.body;
      const userId = req.session.user.sub;

      const result = await User.clearShelf(bookshelf, userId);

      if (result) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ success: false });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  };
}