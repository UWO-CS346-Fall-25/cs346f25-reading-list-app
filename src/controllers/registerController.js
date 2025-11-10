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
    const result = await User.registerUser(req.body.username, req.body.email, req.body.password);
    if (result.user.user_metadata.email_verified === undefined) { // pre-existing account
      res.status(409).json({ success: true, data: result });
    }
    else { // registration successful
      res.status(201).json({ success: true, data: result });
    }
  }
  catch(error) { // catching network error
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};
