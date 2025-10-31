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

exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Login',
    csrfToken: req.csrfToken(),
  });
};

exports.getBookshelf = (req, res) => {
  res.render('bookshelf', {
    title: 'Bookshelf',
    csrfToken: req.csrfToken(),
  });
};

/**
 * POST /
 * Registers a new user
 */
exports.postRegister = async (req, res) => {
  try { // attempting registration
    const result = await User.registerUser(req.body.email, req.body.password, req.body.dataUsage);
    res.status(201).json({ success: true, data: result }); // registration successful
  }
  catch(error) {
    if (error.message === 'Email already exists') { // email already exists
      res.status(409).json({ success: false, message: error.message });
    }
    else { // unable to connect to database
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }
};
