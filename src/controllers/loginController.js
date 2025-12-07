/**
 * Login Controller
 *
 * This controller handles basic navigation on the login page,
 * as well as logging the user into their Bookshelf
 *
 * Primary task:
 * - logs in a user to their account
 */

// Import models if needed
const User = require('../models/User');

/**
* Controller: getHome
* Purpose: Redirects the user to the home page
* Input: req, res, next. (Session data, follow up actions)
* Output: Redirects to /index or shows an error page
*/
exports.getHome = async (req, res, next) => {
  try {
    res.render('index', { // attempting to render the home page
      title: 'Home',
      csrfToken: req.csrfToken(),
    });
  } catch (error) { // catching error if the home page could not be rendered
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
    res.render('register', {
      title: 'Register',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

/**
* Controller: getReset
* Purpose: Redirects the user to the reset page
* Input: req, res, next. (Session data, follow up actions)
* Output: Redirects to /reset or shows an error page
*/
exports.getReset = async (req, res, next) => {
  try {
    res.render('reset', {
      title: 'Reset',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

/**
* Controller: postLogin
* Purpose: attempts to login a user to their account
* Input: req.body.email [user's email], req.body.password [user's password]
* Output: 201 if success, 404 if could not find account, 500 if cannot reach database
*/
exports.postLogin = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [loginController] Attempting to login user`);
  try { // attempting to contact the database
    const response = await User.validateLogin(
      req.body.email,
      req.body.password
    );
    if (response.user === null) { // 404 if no account in database
      console.error(`[${new Date().toISOString()}] [loginController] DB Error: Unable to locate account that matches entered credentials`);
      res.status(404).json({ success: false });
    }
    else { // storing session and 201 if account found
      console.log(`[${new Date().toISOString()}] [loginController] Success: User located`);
      req.session.user = response.session.user.user_metadata;
      res.status(201).json({ success: true });
    }
  } catch (error) {// 500 if cannot connect to database
    console.error(`[${new Date().toISOString()}] [loginController] DB Error: ${error.message}`);
    res.status(500).json({ success: false });
  }
};
