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
 * GET /about
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

exports.getLogin = async (req, res) => {
  try {
    const response = await User.validateLogin(req.body.email, req.body.password);
    if(response.length != 0) {
      res.status(201).json( { success: true } );
    }
    else {
      res.status(500).json( { success: false } );
    }

  } catch (error) {

  }
};
