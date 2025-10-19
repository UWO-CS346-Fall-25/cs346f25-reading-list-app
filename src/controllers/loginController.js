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
// const SomeModel = require('../models/SomeModel');

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
exports.getBooklist= async (req, res, next) => {
  try {
    res.render('booklist', {
      title: 'Booklist',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};
