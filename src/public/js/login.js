/**
 * Login JavaScript File
 *
 * This file contains functions used by the login view
 * to validate the form for logging in a user
 *
 * Primary task:
 * - use the email, and password to login a user
 */
let resolvePromise;

// Adding listeners to the login form when the DOM loads
document.addEventListener('DOMContentLoaded', function () {
  configureCustomAlert();
  initFormValidation();
});

/**
 * A function that acts as a custom alert for the user
 * @param {object} message the alert message
 * @returns a promise that resolves when the user closes the alert
 */
function customAlert(message) {
  const alert = document.getElementById('custom-alert');
  const alertMessage = document.getElementById('alert-message');
  alertMessage.textContent = message;
  alert.style.display = 'block';
  return new Promise(resolve => { resolvePromise = resolve; });
}

/**
 * A function that configures the customer alert
 */
function configureCustomAlert() {
  const customAlert = document.getElementById('custom-alert');
  const okButton = document.getElementById('ok-button');
  okButton.addEventListener('click', function () {
    customAlert.style.display = 'none';
    if (resolvePromise) {
      resolvePromise();
      resolvePromise = null;
    }
  });
  window.addEventListener('click', function (event) {
    if (event.target == customAlert) {
      customAlert.style.display = 'none';
      if (resolvePromise) {
        resolvePromise();
        resolvePromise = null;
      }
    }
  });
}

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
 * Validate the login form
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
      showError(field, 'Please enter a valid Email Address'); // if email field, displaying invalid email error
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
 * Clear error message for a field
 * @param {HTMLElement} field - Form field
 */
function clearError(field) {
  field.nextElementSibling.style.visibility = 'hidden';
  field.classList.remove('error');
  field.style.borderColor = '';
}

/**
 * Processes a validated form
 */
async function processForm() {
  const spinner = document.getElementsByClassName('spinner-container')[0]; // showing activity spinner to prevent multiple login submissions
  const button = document.getElementById('login');
  button.style.opacity = 0.5;
  button.style.pointerEvents = 'none';
  spinner.style.display = 'block';

  const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
  try { // fetch request to attempt to log user into their account
    let response = await fetch('/user_login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token,
      },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      }),
    });
    if (response.status === 201) { // successful login, redirecting user to their bookshelf
      window.location.href = '/bookshelf';
    }
    else if (response.status === 404) { // unsuccessful login, could not locate user, telling user the data is incorrect
      await customAlert('The email or password is incorrect');
    }
    else { // unable to connect to database (500 status), telling user to try again at a later time
      await customAlert('Log in error. Please try again later');
    }
  } catch (error) { // fetch error, telling user to try again at a later time
    await customAlert('Log in error. Please try again later');
  }
  finally {
    button.style.opacity = 1;
    button.style.pointerEvents = 'all';
    spinner.style.display = 'none';
  }
}
