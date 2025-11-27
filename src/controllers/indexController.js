/**
 * Index Controller
 */
const User = require('../models/User');
const Api = require('../models/Api');

/**
 * A special function that must exist for the password reset
 * link in the reset email to work properly
 */
exports.getPassword = async (req, res, next) => {
  try {
    res.render('password', {
      title: 'password',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /login
 * Display the login page
 */
exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Login',
    csrfToken: req.csrfToken(),
  });
};

/**
 * GET /register
 * Display the register page
 */
exports.getRegister = async (req, res, next) => {
  try {
    res.render('register', {
      title: 'Register',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /bookshelf
 * Display the about page
 */
exports.getBookshelf = async (req, res, next) => {
  try {
    res.render('bookshelf', {
      title: 'Bookshelf',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /sign out
 * Display the home page with cleared session
 */
exports.getSignout = async (req, res, next) => {
  try {
    const token = req.csrfToken();
    req.session.destroy((error) => {
      if (error) {
        next(error);
      }
      res.clearCookie('connect.sid');
      res.render('index', {
        title: 'Bookshelf',
        csrfToken: token,
        user: null,
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * A function that appears database
 * data, removes duplicates, and
 * repackages that data in a sorted list
 * @param {object} list - data to sort
 * @returns {Promise<object>} sorted data list
 */
function sortData(list) {
  const dataList = new Set();
  list.forEach((books) => {
    const authorList = Object.values(books)[0];
    authorList.forEach((author) => {
      dataList.add(author);
    });
  });
  return Array.from(dataList).sort();
}

/**
 * GET /
 * Returns the fulls list of authors
 * from the database
 */
exports.getAuthors = async (req, res) => {
  try { // getting authors list
    const result = await User.getAuthors();
    res.status(201).json({ success: true, data: sortData(result) });
  } catch (error) { // setting status if database connection didn't work
    res.status(500).json({ success: false });
  }
};

// THE FUNCTIONS BELOW ARE FOR FUTURE EXPANSION, DO NOT DELETE
// /**
//  * GET /
//  * Returns the fulls list of genres
//  * from the database
//  */
// exports.getGenres = async (req, res) => {
//   try {
//     // getting authors list
//     const result = await User.getGenres();
//     res.status(201).json({ success: true, data: sortData(result) });
//   } catch (error) {
//     // setting status if database connection didn't work
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * GET /
//  * Returns the largest page count form
//  * the books table
//  */
// exports.getPages = async (req, res) => {
//   try {
//     // getting largest page count
//     const result = await User.getPages();
//     res.status(201).json({ success: true, data: result });
//   } catch (error) {
//     // setting status if database connection didn't work
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

/**
 * GET /
 * Returns the fulls list of books
 * from the database
 */
exports.getTrending = async (req, res) => {
  try {
    // getting recommended list
    const result = await User.getTrending();
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    // setting status if database connection didn't work
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /
 * Returns a filtered list of
 * books from the database
 */
exports.getFilter = async (req, res) => {
  try {
    // getting filtered list
    const result = await User.getFiltered(
      req.query.author,
      // req.query.genre, FOR FUTURE EXPANSION, DO NOT DELETE
      // req.query.page_count
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) { // setting status if database connection didn't work
    res.status(500).json({ success: false });
  }
};

/**
 * POST /
 * Adds a book to the select book window
 */
exports.addBook = async (req, res) => {
  try { // attempting to contact Open Library
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
        let displayBook = { // building a book to display in the selector window
          title: book.title,
          authors: book.author_name,
          cover: coverURL,
        };
        bookList.push(displayBook); // adding a book to the book list
      }
      res.status(201).json({ success: true, data: bookList }); // returning the completed list
    } else { // no editions for a book were found
      res.status(404).json({ success: false, message: 'Book not found' });
    }
  } catch (error) { // could not connect to Open Library
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /
 * Adds a book to the users to-read bookshelf
 */
exports.addBookToBookshelf = async (req, res) => {
  if (req.session.user) { // only adding if a user is logged in
    try { // attempting to insert the book
      const result = await User.addBook(
        req.body.title,
        req.body.authors,
        'to-read-books',
        req.session.user.sub
      );
      if (result) { // the insert worked
        res.status(201).json({ success: true });
      } else { // the insert failed
        res.status(409).json({ success: false });
      }
    } catch (error) { // network error
      res.status(500).json({ success: false });
    }
  } else { // no user is logged in
    res.status(403).json({ success: false });
  }
};
