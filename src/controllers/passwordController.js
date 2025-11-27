/**
 * Password Controller
 *
 * This controller handles basic navigation on the password page,
 * as well as resetting a user's password
 *
 * Primary task:
 * - resets a user's password
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
    res.render('index', {
      // attempting to render the home page
      title: 'Home',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    // catching error if the home page could not be rendered
    next(error);
  }
};

/**
* Controller: postResetPassword
* Purpose: attempts to reset a user's password
* Input: req, res (Session data)
* Output: 201 if success, 404 if failure, 500 if cannot reach database
*/
exports.postResetPassword = async (req, res) => {
  console.log(`[${new Date().toISOString()}] [passwordController] Attempting password reset`);
  try { // attempting password reset
    const result = await User.resetPassword(req.body.password, req.body.accessToken, req.body.refreshToken);
    if (result) { // password reset successful
      console.log(`[${new Date().toISOString()}] [passwordController] Success: Password reset`);
      res.status(201).json({ success: true });
    }
    else {  // password reset unsuccessful
      console.error(`[${new Date().toISOString()}] [passwordController] DB Error: Unable to reset password`);
      res.status(404).json({ success: true });
    }
  }
  catch(error) { // catching network error
    console.error(`[${new Date().toISOString()}] [passwordController] DB Error: ${error.message}`);
    res.status(500).json({ success: false });
  }
};
