/**
 * Index Controller
 */
const User = require('../models/User');

/**
 * GET /
 * Display the home page
 */
exports.getHome = async (req, res, next) => {
  try {
    res.render('index', {
      title: 'Home',
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
exports.signOut = async (req, res, next) => {
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
  list.forEach(dataPoint => {
    dataList.add(Object.values(dataPoint)[0]);
  });
  return (Array.from(dataList)).sort();
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
  }
  catch(error) { // setting status if database connection didn't work
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /
 * Returns the fulls list of genres
 * from the database
 */
exports.getGenres = async (req, res) => {
  try { // getting authors list
    const result = await User.getGenres();
    res.status(201).json({ success: true, data: sortData(result) });
  }
  catch(error) { // setting status if database connection didn't work
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /
 * Returns the largest page count form
 * the books table
 */
exports.getPages = async (req, res) => {
  try { // getting largest page count
    const result = await User.getPages();
    res.status(201).json({ success: true, data: result });
  }
  catch(error) { // setting status if database connection didn't work
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /
 * Returns the fulls list of books
 * from the database
 */
exports.getRecommended = async (req, res) => {
  try { // getting recommended list
    const result = await User.getRecommended();
    res.status(201).json({ success: true, data: result });
  }
  catch(error) { // setting status if database connection didn't work
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /
 * Returns a filtered list of
 * books from the database
 */
exports.getFilter = async (req, res) => {
  try { // getting filtered list
    const result = await User.getFiltered(req.query.author, req.query.genre, req.query.page_count);
    res.status(201).json({ success: true, data: result });
  }
  catch(error) { // setting status if database connection didn't work
    res.status(500).json({ success: false, message: error.message });
  }
}
