/**
 * Register Controller
 *
 * This controller handles basic navigation on the registration page,
 * as well as register users to use Bookshelf
 *
 * Primary task:
 * - register new user accounts
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
* Controller: postRegister
* Purpose: attempts to register a new user account
* Input: req, res, next. (Session data, follow up actions)
* Output: 201 if success, 409 if already exists, 500 if cannot reach database
*/
exports.postRegister = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [registerController] Attempting to register new user`);
  try { // attempting registration
    const result = await User.registerUser(req.body.username, req.body.email, req.body.password);
    if (result.user.user_metadata.email_verified === undefined) { // pre-existing account
      console.error(`[${new Date().toISOString()}] [RegisterController] DB Error: An account with the entered email already exists`);
      res.status(409).json({ success: true });
    }
    else { // registration successful
      console.log(`[${new Date().toISOString()}] [RegisterController] Success: Account created:`);
      console.log(result);
      res.status(201).json({ success: true });
    }
  }
  catch(error) { // catching network error
    console.error(`[${new Date().toISOString()}] [RegisterController] DB Error: ${error.message}`);
    res.status(500).json({ success: false });
  }
};
