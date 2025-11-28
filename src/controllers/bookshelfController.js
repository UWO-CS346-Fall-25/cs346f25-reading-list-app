/**
 * Bookshelf Controller
 *
 * This controller handles basic navigation on the bookshelf page,
 * as well as displaying the books from the user's bookshelves, adding
 * books to a requested bookshelf, moving books between bookshelves, and
 * deleted books from bookshelves
 *
 * Primary tasks:
 * - displays user's books
 * - adds books to bookshelves
 * - move books between bookshelves
 * - deletes books from bookshelves
 */
const User = require('../models/User');
const Api = require('../models/Api');

/**
* Controller: getHome
* Purpose: Redirects the user to the home page
* Input: req, res, next. (Session data, follow up actions)
* Output: Redirects to /index or shows an error page
*/
exports.getHome = async (req, res, next) => {
  try {
    res.render('index', { // attempting to render the index page
      title: 'Home',
      csrfToken: req.csrfToken(),
    });
  } catch (error) { // catching error if the index page could not be rendered
    next(error);
  }
};

/**
* Controller: getLogout
* Purpose: Destroys the current session and redirects the user back to the index page
* Input: req, res, next. (Session data, follow up actions)
* Output: Redirects to /index or shows an error page
*/
exports.getLogout = async (req, res, next) => {
  try {
    const token = req.csrfToken();
    req.session.destroy((error) => { // attempting to destroy the current session
      if (error) {
        next(error);
      }
      res.clearCookie('connect.sid');
      res.render('index', { // attempting to render the index page
        title: 'Home',
        csrfToken: token,
        user: null,
      });
    });
  } catch (error) { // catching error if the index page could not be rendered
    next(error);
  }
};

/**
* Controller: getToReadShelf
* Purpose: Retrieves the user's books_to_read table
* Input: req.sessions.user.sub [user id]
* Output: A list of books on the user's books_to_read table
*/
exports.getToReadShelf = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [bookshelfController] Attempting to get user's books_to_read list`);
  try { // getting to-read list
    const result = await User.getToRead(req.session.user.sub);
    console.log(`[${new Date().toISOString()}] [bookshelfController] Success: books_to_read list:`);
    console.log(result);
    res.status(201).json({ success: true, data: result });
  } catch (error) { // setting status if database connection didn't work
      console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: ${error.message}`);
      res.status(500).json({ success: false });
  }
};

/**
* Controller: getToReadShelf
* Purpose: Retrieves the user's books_being_read table
* Input: req.sessions.user.sub [user id]
* Output: A list of books on the user's books_being_read table
*/
exports.getReadingShelf = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [bookshelfController] Attempting to get user's books_being_read list`);
  try {
    // getting reading list
    const result = await User.getReading(req.session.user.sub);
    console.log(`[${new Date().toISOString()}] [bookshelfController] Success: books_being_read list:`);
    console.log(result);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    // setting status if database connection didn't work
    console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: ${error.message}`);
    res.status(500).json({ success: false });
  }
};

/**
* Controller: getToReadShelf
* Purpose: Retrieves the user's books_read table
* Input: req.sessions.user.sub [user id]
* Output: A list of books on the user's books_read table
*/
exports.getReadShelf = async (req, res) => {
    console.log(`[${new Date().toISOString()}] [bookshelfController] Attempting to get user's books_read list`);
  try {
    // getting read list
    const result = await User.getRead(req.session.user.sub);
    console.log(`[${new Date().toISOString()}] [bookshelfController] Success: books_read list:`);
    console.log(result);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    // setting status if database connection didn't work
    console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: ${error.message}`);
    res.status(500).json({ success: false });
  }
};

/**
* Controller: postAddBooksToSelector
* Purpose: Adds all the editions of a book to the book selector
* Input: req.body.title, req.body.author
* Output: Status: 201 is loaded all editions, 404 if could not find editions, 500 if could not connect to API
*/
exports.postAddBooksToSelector = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [bookshelfController] Attempting to retrieve edition list from OpenLibrary`);
  try {// attempting to contact Open Library
    const result = await Api.getBookList(req.body.title, req.body.author);
    if (result.ok) { // determining if the fetch worked
      const books = await result.json();
      let bookList = []; // building a list of all editions for a given title
      for (const book of books.docs) { // getting a book cover if it exists
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
        bookList.push({ title: book.title, authors: book.author_name, cover: coverURL }); // adding a book to the book list
      }
      console.log(`[${new Date().toISOString()}] [bookshelfController] Success: Edition list:`);
      console.log(bookList);
      res.status(201).json({ success: true, data: bookList }); // returning the completed list
    }
    else { // no editions for a book were found
      console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: Unable to retrieve edition list from OpenLibrary`);
      res.status(404).json({ success: false });
    }
  } catch (error) { // could not connect to Open Library
      console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: ${error.message}`);
      res.status(500).json({ success: false });
  }
};

/**
* Controller: postAddBookToBookshelf
* Purpose: Adds a book to a user's bookshelf
* Input: req.session.user, req.body.title, req.body.authors, req.body.table
* Output: Status: 201 if added, 409 if already on shelf, 500 if could not access database, 403 if user is not logged in
*/
exports.postAddBookToBookshelf = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [bookshelfController] Attempting to add book to user's shelf`);
  if (req.session.user) { // checking to make sure the user is logged in
    try { // trying to insert the book
      const result = await User.addBook(
        req.body.title,
        req.body.authors,
        req.body.table,
        req.session.user.sub
      );
      if (result) { // insert worked
        console.log(`[${new Date().toISOString()}] [bookshelfController] Success: Book added:`);
        console.log(result);
        res.status(201).json({ success: true, data: result });
      } else { // book already exists in the table
        console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: Book is already on the bookshelf`);
        res.status(409).json({ success: false });
      }
    } catch (error) { // network error
      console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: ${error.message}`);
      res.status(500).json({ success: false });
    }
  } else { // user is no longer logged in
    console.error(`[${new Date().toISOString()}] [bookshelfController] Error: The user is not logged in`);
    res.status(403).json({ success: false });
  }
};

/**
* Controller: deleteMoveBook
* Purpose: Moves a book from one bookshelf to another
* Input: req.body.book_id, req.body.start [current shelf], req.body.end [future shelf], req.session.user.sub [user id]
* Output: Status: 201 if moved, 404 if the book could not be located, 409 if insert worked, but delete failed, 500 if could not access database
*/
exports.deleteMoveBook = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [bookshelfController] Attempting to move a book`);
  try { // attempting to move the book
    let result = await User.moveBook(
      req.body.book_id,
      req.body.start,
      req.body.end,
      req.session.user.sub
    );
    if (result) { // the insert worked
      console.log(`[${new Date().toISOString()}] [bookshelfController] Success: Book moved:`);
      console.log(result);
      res.status(201).json({ success: true, data: result });
    } else if (result === null) { // the insert worked, but the delete failed
      console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: Could not delete book`);
      res.status(409).json({ success: false });
    } else { // the initial select failed, or the insert failed
      console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: Could not locate or insert book`);
      res.status(404).json({ success: false });
    }
  }
    catch(error) { // could not complete move
      console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: ${error.message}`);
      res.status(500).json({ success: false });
  }
};

/**
 * DELETE /move-btn
 * Moves a book from one shelf to another using the Move Book modal (by title)
 */
exports.deleteMoveBookBtn = async (req, res) => {
  // must be logged in
  if (!req.session.user) {
    return res
      .status(403)
      .json({ success: false, message: 'User not logged in.' });
  }

  const userId = req.session.user.sub;
  const { title, start, end } = req.body;

  if (!title || !start || !end) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing title/start/end.' });
  }

  if (start === end) {
    return res.status(400).json({
      success: false,
      message: 'Start and end shelves must be different.',
    });
  }

  try {
    const result = await User.moveBookByTitle(title, start, end, userId);

    if (result === 'NOT_FOUND') {
      // no book with that title in the origin shelf
      return res.status(404).json({
        success: false,
        message: 'Book not found on the origin shelf.',
      });
    } else if (result === null) {
      // insert worked, delete failed
      return res.status(409).json({ success: false });
    } else if (result) {
      // everything worked
      return res.status(201).json({ success: true, data: result });
    } else {
      // DB error
      return res.status(500).json({ success: false });
    }
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

/**
* Controller: deleteRemoveBook
* Purpose: Removes a book from a user's bookshelf
* Input: req.body.book_id, req.body.bookshelf
* Output: Status: 201 if removed, 500 if could not access database
*/
exports.deleteRemoveBook = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [bookshelfController] Attempting to remove a book`);
  try {
    // attempt to delete a book
    await User.removeBook(req.body.book_id, req.body.bookshelf);
    console.log(`[${new Date().toISOString()}] [bookshelfController] Success: book has been removed`);
    res.status(201).json({ success: true });
  } catch (error) {
    // network error
    console.error(`[${new Date().toISOString()}] [bookshelfController] DB Error: ${error.message}`);
    res.status(500).json({ success: false });
  }
};

/**
 * DELETE /
 * Clear all books from the requested shelf
 * @param {} req
 * @param {*} res
 * @returns
 */
exports.deleteClearShelf = async (req, res) => {
  try {
    //if the user is logged in, get the bookshelf they're targeting,
    //their id, and perform the clear
    if (!req.session.user) {
      return res
        .status(403)
        .json({ success: false, message: 'User not logged in.' });
    }

    const { bookshelf } = req.body;
    const userId = req.session.user.sub;

    const result = await User.clearShelf(bookshelf, userId);

    if (result) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
