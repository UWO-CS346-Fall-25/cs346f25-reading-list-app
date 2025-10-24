/**
 * Index Controller
 */
const User = require('../models/User');

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
