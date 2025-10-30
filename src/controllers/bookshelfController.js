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
      title: 'Bookshelf',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /logout
 * Display the home page with cleared session
 */
exports.logout = async (req, res, next) => {
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
