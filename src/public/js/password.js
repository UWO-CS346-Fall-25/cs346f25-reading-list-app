/**
 * Password JavaScript File
 *
 * This file contains functions used by the password view
 * to validate the form for a password reset
 *
 * Primary task:
 * - resets the user's password
 */
let resolvePromise;

// Adding listeners to the register form when the DOM loads
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
  form.addEventListener('submit', function (e) {
    // adding submit listener
    if (validateForm(form)) {
      // validate the form before processing it
      processForm(); // processing the form
    }
    e.preventDefault(); // preventing the page from reloading
  });
}

/**
 * Validating the password form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} - True if form is valid
 */
function validateForm(form) {
  let isValid = true; // local bool to support one-way-in one-way-out structure
  const requiredFields = form.querySelectorAll('[required]'); // retrieving required fields
  requiredFields.forEach((field) => {// validating each required field
    if (!field.value.trim()) {// verifying the field contains data
      showError(field, 'This field is required'); // displaying error if the field contains no data
      isValid = false; // marking the form as invalid
    }
    else if (!field.checkValidity()) { // verifying each field meets requirements
      showError(field, 'Password must be at least 10 characters long');
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
  const spinner = document.getElementsByClassName('spinner-container')[0]; // getting activity spinner to display loading
  const button = document.getElementById('enter');
  button.style.opacity = 0.5;
  button.style.pointerEvents = 'none';
  spinner.style.display = 'block';

  const token = document.getElementsByName('csrf-token')[0].getAttribute('content'); // retrieving csfrToken for safe fetch
  try {
    // eslint-disable-next-line no-undef -- this comment prevents the IDE from registerer the line below this as an error
    const params = new URLSearchParams(window.location.hash.substring(1)); // getting access and refresh tokens from current session
    let response = await fetch('/reset_password', { // attempting fetch to reset password
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token,
      },
      body: JSON.stringify({
        password: document.getElementById('password').value,
        accessToken: params.get('access_token'),
        refreshToken: params.get('refresh_token'),
      })
    });
    if (response.status === 201) { // reset successful, redirecting user and telling them to login
      await customAlert('Password successfully reset! Please login to continue.');
      window.location.href = '/index';
    }
    else if (response.status === 404) { // reset unsuccessful, telling user to request a new link
      await customAlert('Password reset link expired. Please request a new reset link.');
    }
    else { // could not reach supabase, telling user to try again later
      await customAlert('Unable to reset password at this time. Please try again later.');
    }
  }
  catch(error) { // could not execute fetch request, telling user to try again later
    await customAlert('Unable to reset password at this time. Please try again later.');
  }
  finally { // closing the activity spinner
    button.style.opacity = 1;
    button.style.pointerEvents = 'all';
    spinner.style.display = 'none';
  }
}
