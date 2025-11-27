/**
 * Register JavaScript File
 *
 * This file contains functions used by the register view
 * to validate the form for registering a user
 *
 * Primary task:
 * - use the username, email, and password to register a user account
 */

// Adding listeners to the register form when the DOM loads
document.addEventListener('DOMContentLoaded', function () {
  initFormValidation();
});

/**
 * Initialize form validation
 */
function initFormValidation() {
  const form = document.querySelector('form'); // retrieving the form
  form.addEventListener('submit', function (e) { // adding submit listener
      if (validateForm(form)) { // validate the form before processing it
        processForm(); // processing the form
      }
      e.preventDefault(); // preventing the page from reloading
  });
}

/**
 * Validating the registration form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} - True if form is valid
 */
function validateForm(form) {
  let isValid = true; // local bool to support one-way-in one-way-out structure
  const requiredFields = form.querySelectorAll('[required]'); // retrieving required fields
  requiredFields.forEach((field) => { // validating each required field
    if (!field.value.trim()) { // verifying the field contains data
      showError(field, 'This field is required'); // displaying error if the field contains no data
      isValid = false; // marking the form as invalid
    }
    else if (!field.checkValidity()) { // verifying each field meets requirements
      if (field.type === 'email') { // if email field, displaying invalid email error
        showError(field, 'Please enter a valid Email Address');
      } else if (field.type === 'password') { // if password field, displaying password too short error
        showError(field, 'Password must be at least 10 characters long');
      }
      else { // if username field, displaying username too short error
        showError(field, 'Username must be at least 5 characters long');
      }
      isValid = false; // marking the form as invalid
    }
    else {
      clearError(field); // clearing error messages if form is valid
    }
  });
  return isValid; // returning form validity
}

/**
 * Show error message for an invalid field
 * @param {HTMLElement} field - Form field
 * @param {string} message - Error message
 */
function showError(field, message) {
  // Remove any existing error
  clearError(field);

  // Get the error element
  const error = field.nextElementSibling;
  error.textContent = message;
  error.style.visibility = 'visible';

  // Add error class to field
  field.classList.add('error');
  field.style.borderColor = 'red';
}

/**
 * Clear error message for a valid field
 * @param {HTMLElement} field - Form field
 */
function clearError(field) {
  field.nextElementSibling.style.visibility = 'hidden';
  field.classList.remove('error');
  field.style.borderColor = '';
}

/**
 * Processing a validated form
 */
async function processForm() {
  const spinner = document.getElementsByClassName('spinner-container')[0]; // showing activity spinner to prevent multiple register submissions
  const button = document.getElementById('register');
  button.style.opacity = 0.5;
  button.style.pointerEvents = 'none';
  spinner.style.display = 'block';

  const token = document.getElementsByName("csrf-token")[0].getAttribute('content'); // retrieving csfrToken for safe fetch
  try { // fetch request to add register a user
    let response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token,
      },
      body: JSON.stringify({
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      }),
    });
    if (response.status === 201) { // successful register, telling user to complete registration in their email
      alert("Registration Successful!\nPlease complete the validation process in your email.");
      window.location.href = '/index';
    }
    else if (response.status === 409) { // existing email address, telling user to login
      alert("An account already exists with this email! Please login to continue.");
      window.location.href = '/login';
    }
    else { // unable to connect to database (500 status), telling user to try again at a later time
      alert("Account registration error. Please try again later.");
    }
  }
  catch(error) { // fetch error, telling user to try again at a later time
    alert("Account registration error. Please try again later.");
  }
  finally {
    button.style.opacity = 1;
    button.style.pointerEvents = 'all';
    spinner.style.display = 'none';
  }
}
