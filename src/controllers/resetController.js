/**
 * Reset Controller
 *
 * This controller handles basic navigation on the reset page,
 * as well as sending a password reset email
 *
 * Primary task:
 * - sends the user a password reset email
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
* Controller: getLogin
* Purpose: Redirects the user to the login page
* Input: req, res, next. (Session data, follow up actions)
* Output: Redirects to /login or shows an error page
*/
exports.getLogin = (req, res, next) => {
  try {
    res.render('login', { // attempting to render the login page
      title: 'Login',
      csrfToken: req.csrfToken(),
    });
  }
  catch(error) { // catching error if the login page could not be rendered
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
 * Controller: postPasswordReset
 * Purpose: sends the user a password reset email
 * Input: req, res (Session data)
 * Output: 201 if success, 409 if email could not be send, 500 if cannot reach database
 */
exports.postPasswordReset = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [resetController] Attempting to send password reset email`);
  try { // attempting to contact the database
    const response = await User.passwordReset(
      req.body.email,
    );
    if (response) { // 201 password reset sent
      console.log(`[${new Date().toISOString()}] [resetController] Success: Email sent: ${response}`);
      res.status(201).json({ success: response });
    } else { // 404 password reset not sent
      console.error(`[${new Date().toISOString()}] [resetController] DB Error: Email was not sent`);
      res.status(404).json({ success: response });
    }
  } catch (error) { // 500 if cannot connect to database
    console.error(`[${new Date().toISOString()}] [resetController] DB Error: ${error.message}`);
    res.status(500).json({ success: false });
  }
};
