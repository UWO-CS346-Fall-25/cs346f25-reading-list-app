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
    res.render('booklist', {
      title: 'Books',
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
exports.getLogin = async (req, res, next) => {
  try {
    res.render('login', {
      title: 'Login',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};
