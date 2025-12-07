/**
 * Index Controller
 *
 * This controller handles basic navigation on the index page,
 * as well as displaying trending books and adding books to a user's
 * to_read bookshelf
 *
 * Primary tasks:
 * - displays trending books
 * - adds requested books to a user's bookshelf
 */
const User = require('../models/User');
const Api = require('../models/Api');

/**
* Controller: getPassword
* Purpose: A special function that must exist for the password reset link in the reset email to work properly
* Input: req, res, next. (Session data, follow up actions)
* Output: Redirects to /password or shows an error page
*/
exports.getPassword = async (req, res, next) => {
  try {
    res.render('password', { // attempting to render the password page
      title: 'Password',
      csrfToken: req.csrfToken(),
    });
  } catch (error) { // catching error if the password page could not be rendered
    next(error);
  }
};

/**
* Controller: getLogin
* Purpose: Redirects the user to the login page
* Input: req, res, next. (Session data, follow up actions)
* Output: Redirects to /login or shows an error page
*/
exports.getLogin = (req, res, next) => {
  try {
    res.render('login', { // attempting to render the login page
      title: 'Login',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {  // catching error if the login page could not be rendered
    next(error);
  }
};

/**
* Controller: getRegister
* Purpose: Redirects the user to the register page
* Input: req, res, next. (Session data, follow up actions)
* Output: Redirects to /register or shows an error page
*/
exports.getRegister = async (req, res, next) => {
  try {
    res.render('register', { // attempting to render the register page
      title: 'Register',
      csrfToken: req.csrfToken(),
    });
  } catch (error) { // catching error if the register page could not be rendered
    next(error);
  }
};

/**
* Controller: getBookshelf
* Purpose: Redirects the user to the bookshelf page
* Input: req, res, next. (Session data, follow up actions)
* Output: Redirects to /bookshelf or shows an error page
*/
exports.getBookshelf = async (req, res, next) => {
  try {
    res.render('bookshelf', { // attempting to render the bookshelf page
      title: 'Bookshelf',
      csrfToken: req.csrfToken(),
    });
  } catch (error) { // catching error if the bookshelf page could not be rendered
    next(error);
  }
};

/**
* Controller: getSignout
* Purpose: Destroys the current session and redirects the user back to the index page
* Input: req, res, next. (Session data, follow up actions)
* Output: Redirects to /index or shows an error page
*/
exports.getSignout = async (req, res, next) => {
  try {
    req.session.destroy((error) => { // attempting to destroy the current session
      if (error) {
        next(error);
      }
      res.clearCookie('connect.sid');
      res.redirect('index');
    });
  } catch (error) { // catching error if the index page could not be rendered
    next(error);
  }
};

/**
* Controller: sortData
* Purpose: Prevent duplicates and alphabetizes data
* Input: list [a list of data to sort]
* Output: A sorted list of the param data
*/
function sortData(list) {
  const dataSet = new Set(); // set to prevent duplicates
  list.forEach((books) => {
    const dataList = Object.values(books)[0]; // retrieving each data list
    dataList.forEach((author) => { // adding each data point
      dataSet.add(author);
    });
  });
  return Array.from(dataSet).sort(); // returning the sorted array of data without duplicates
}

/**
* Controller: getAuthors
* Purpose: Retrieves the lists of authors for all the trending books
* Input: req [not used, but required], res [response data]
* Output: Sorted list of authors
*/
exports.getAuthors = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [indexController] Attempting to get author list`);
  try { // getting authors list
    const result = await User.getAuthors();
    const sortedList = sortData(result);
    console.log(`[${new Date().toISOString()}] [indexController] Success: Number of authors retrieved: ${sortedList.length}`);
    res.status(201).json({ success: true, data: sortedList });
  }
  catch (error) { // setting status if database connection didn't work
    console.error(`[${new Date().toISOString()}] [indexController] DB Error: ${error.message}`);
    res.status(500).json({ success: false });
  }
};

/**
* Controller: getPages
* Purpose: Retrieves the maximum number of pages any given book contains in the books_being_read table
* Input: req [not used, but required], res [response data]
* Output: A value representing the maximum number of pages
*/
exports.getPages = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [indexController] Attempting to retrieve max pages numbers`);
  try {
    // getting largest page count
    const result = await User.getPages();
    console.log(`[${new Date().toISOString()}] [indexController] Success: Max page numbers: ${result}`);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    // setting status if database connection didn't work
    console.error(`[${new Date().toISOString()}] [indexController] DB Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
* Controller: getFilter
* Purpose: Retrieves the list of filtered trending books
* Input: req.query.author [the filter option for trending books]
* Output: Trending book list where each book contains the param author
*/
exports.getFilter = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [indexController] Attempting to retrieve filtered list`);
  try {// getting filtered list
    const result = await User.getFiltered(
      req.query.author,
      req.query.page_count
    );
    console.log(`[${new Date().toISOString()}] [indexController] Success: Number of books in the filtered list: ${result.length}`);
    res.status(201).json({ success: true, data: result });
  }
  catch (error) {
    // setting status if database connection didn't work
    console.error(`[${new Date().toISOString()}] [indexController] DB Error: ${error.message}`);
    res.status(500).json({ success: false });
  }
};

/**
* Controller: getTrending
* Purpose: Retrieves the list of trending books
* Input: req [not user, but required], res [response data]
* Output: Trending book list
*/
exports.getTrending = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [indexController] Attempting to retrieve trending list`);
  try { // getting recommended list
    const result = await User.getTrending();
    console.log(`[${new Date().toISOString()}] [indexController] Success: Number of books in the trending list: ${result.length}`);
    res.status(201).json({ success: true, data: result });
  } catch (error) { // setting status if database connection didn't work
    console.error(`[${new Date().toISOString()}] [indexController] DB Error: ${error.message}`);
    res.status(500).json({ success: false });
  }
};

/**
* Controller: postAddBookToSelector
* Purpose: Adds all the editions of a book to the book selector
* Input: req.body.title, req.body.author
* Output: Status: 201 is loaded all editions, 500 if could not connect to API
*/
exports.postAddBookToSelector = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [indexController] Attempting to retrieve edition list from OpenLibrary`);
  try {// attempting to contact Open Library
    const result = await Api.getBookList(req.body.title, req.body.author);
    let bookList = []; // building a list of all editions for a given title
    for (const edition of result) { // getting the book cover
      let coverURL = null;
      if (edition.cover_i) {
        coverURL = `https://covers.openlibrary.org/b/id/${edition.cover_i}-L.jpg`;
      } else if (edition.cover_edition_key) {
        coverURL = `https://covers.openlibrary.org/b/olid/${edition.cover_edition_key}-L.jpg`;
      } else if (edition.ocaid) {
        coverURL = `https://archive.org/services/img/${edition.ocaid}`;
      }
      else {
        coverURL = `https://covers.openlibrary.org/b/id/${edition.cover}-L.jpg`;
      }
      // console.log(edition.isbn_13[0]);
      bookList.push({ isbn: edition.isbn_13[0], title: edition.title, authors: edition.authors, pageCount: edition.number_of_pages, cover: coverURL }); // adding a book to the book list
    }
    console.log(`[${new Date().toISOString()}] [indexController] Success: Number of editions found: ${bookList.length}`);
    res.status(201).json({ success: true, data: bookList }); // returning the completed list
  } catch (error) { // could not connect to Open Library
      console.error(`[${new Date().toISOString()}] [indexController] API Error: ${error.message}`);
      res.status(500).json({ success: false });
  }
};

/**
* Controller: postAddBookToSelector
* Purpose: Adds a book to the user's bookshelf
* Input: req.session.user, req.body.title, req.body.authors
* Output: Status: 201 if added, 409 if already on shelf, 500 if could not access database, 403 if user is not logged in
*/
exports.postAddBookToBookshelf = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [indexController] Attempting to add book to bookshelf on index`);
  if (req.session.user) {
    // only adding if a user is logged in
    try {
      // attempting to insert the book
      const result = await User.addBook(
        req.body.isbn,
        req.body.title,
        req.body.authors,
        req.body.pageCount,
        'to-read-books',
        req.session.user.sub
      );
      if (result) { // the insert worked
        console.log(`[${new Date().toISOString()}] [indexController] Success: Book added`);
        res.status(201).json({ success: true });
      } else { // the book already exists
        console.error(`[${new Date().toISOString()}] [indexController] DB Error: The book already exists on the user's bookshelf`);
        res.status(409).json({ success: false });
      }
    } catch (error) { // network error
      console.error(`[${new Date().toISOString()}] [indexController] DB Error: ${error.message}`);
      res.status(500).json({ success: false });
    }
  } else { // no user is logged in
    console.error(`[${new Date().toISOString()}] [indexController] User is not logged in`);
    res.status(403).json({ success: false });
  }
};
