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
    // Fetch any data needed for the home page
    // const data = await SomeModel.findAll();

    res.render('index', {
      title: 'Home',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Login',
    csrfToken: req.csrfToken(),
  });
};

/**
 * GET /about
 * Display the about page
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
