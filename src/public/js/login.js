/**
 * Main JavaScript File
 *
 * This file contains client-side JavaScript for your application.
 * Use vanilla JavaScript (no frameworks) for DOM manipulation and interactions.
 *
 * Common tasks:
 * - Form validation
 * - Interactive UI elements
 * - AJAX requests
 * - Event handling
 */
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  initFormValidation();
});

/**
 * Initialize form validation
 */
function initFormValidation() {
  const form = document.querySelector('form');
  form.addEventListener('submit', function (e) {
      if (validateForm(form)) {
        processForm();
      }
      e.preventDefault();
  });
}

/**
 * Validate a form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} - True if form is valid
 */
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      showError(field, 'This field is required');
      isValid = false;
    }
    else if (!field.checkValidity()) {
      showError(field, 'Please enter a valid Email Address');
      isValid = false;
    }
    else {
      clearError(field);
    }
  });
  return isValid;
}

/**
 * Show error message for a field
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
  const token = document.getElementsByName("csrf-token")[0].getAttribute('content');
  try { // fetch request to attempt to log user into their account
    let response = await fetch('/user_login',
                              { method: 'POST',
                                headers: {
                                'Content-Type': 'application/json',
                                'CSRF-Token': token},
                                body: JSON.stringify({ email: document.getElementById("email").value,
                                                       password: document.getElementById("password").value}),
                              });
    if (response.status === 201) { // successful register
      window.location.href = '/bookshelf';
    }
    else if (response.status === 404) { // no account found
      alert("The email or password is incorrect");
    }
    else { // unable to access the database
      alert("Log in error. Please try again later.");
    }
  }
  catch(error) { // unable to find route to register
    alert("Log in error. Please try again later.");
  }
}
