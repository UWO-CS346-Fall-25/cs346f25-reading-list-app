/**
 * Reset JavaScript File
 *
 * This file contains functions used by the reset view
 * to validate the form for resetting a user's password
 *
 * Primary task:
 * - use the email to send a password reset email
 */
let resolvePromise;

// Adding listeners to the reset form when the DOM loads
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
 * Validate the reset form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} - True if form is valid
 */
function validateForm(form) {
  let isValid = true; // local bool to support one-way-in one-way-out structure
  const requiredFields = form.querySelectorAll('[required]'); // retrieving required fields
  requiredFields.forEach((field) => {
    // validating each required field
    if (!field.value.trim()) {
      // verifying the field contains data
      showError(field, 'This field is required'); // displaying error if the field contains no data
      isValid = false; // marking the form as invalid
    } else if (!field.checkValidity()) {
      // verifying each field meets requirements
      showError(field, 'Please enter a valid Email Address'); // if email field, displaying invalid email error
      isValid = false; // marking the form as invalid
    } else {
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
  const spinner = document.getElementsByClassName('spinner-container')[0];

  const button = document.getElementById('enter');
  button.style.opacity = 0.5;
  button.style.pointerEvents = 'none';
  spinner.style.display = 'block';

  const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
  try { // attempting to the fetch the password reset email
    let response = await fetch('/password_reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token,
      },
      body: JSON.stringify({
        email: document.getElementById('email').value,
      }),
    });
    if (response.status === 201) {// email sent, redirecting user new password view
      await customAlert('The password reset email has been sent. Please complete the process in your email.');
      window.location.href = '/index';
    } else if (response.status === 404) {// email not sent, telling user to try again at a later time
      await customAlert('We could not send the password reset at this time. Please try again later.');
    } else {// unable to connect to database (500 status), telling user to try again at a later time
      await customAlert('We could not send the password reset at this time. Please try again later.');
    }
  }
  catch (error) {// fetch error, telling user to try again at a later time
    await customAlert('We could not send the password reset at this time. Please try again later.');
  }
  finally {
    button.style.opacity = 1;
      button.style.pointerEvents = 'all';
      spinner.style.display = 'none';
  }
}
