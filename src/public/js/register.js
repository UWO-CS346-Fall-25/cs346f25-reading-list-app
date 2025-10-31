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
      if (field.type === 'email') {
        showError(field, 'Please enter a valid Email Address');
      }
      else {
        showError(field, 'Password must be at least 10 characters long');
      }
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
  try { // fetch request to add register a user
    let response = await fetch('/register',
                              { method: 'POST',
                                headers: {
                                'Content-Type': 'application/json',
                                'CSRF-Token': token},
                                body: JSON.stringify({ email: document.getElementById("email").value,
                                                       password: document.getElementById("password").value,
                                                       dataUsage: document.getElementById("data-input").checked}),
                              });
    if (response.status === 201) { // successful register
      alert("Registration Successful!\nPlease login to continue.");
      window.location.href = '/login';
    }
    else if (response.status === 409) { // existing email address
      alert("An account already exists with this email!");
    }
    else { // unable to connect to database
      alert("Account registration error. Please try again later.");
    }
  }
  catch(error) { // unable to find route to register
    alert("Account registration error. Please try again later.");
  }
}

// /**
//  * Initialize interactive elements
//  */
// function initInteractiveElements() {
//   // Example: Add smooth scrolling to anchor links
//   const anchorLinks = document.querySelectorAll('a[href^="#"]');

//   anchorLinks.forEach((link) => {
//     link.addEventListener('click', function (e) {
//       const targetId = this.getAttribute('href');
//       if (targetId === '#') return;

//       const targetElement = document.querySelector(targetId);
//       if (targetElement) {
//         e.preventDefault();
//         targetElement.scrollIntoView({
//           behavior: 'smooth',
//           block: 'start',
//         });
//       }
//     });
//   });
// }

// /**
//  * Make an AJAX request
//  * @param {string} url - Request URL
//  * @param {object} options - Request options (method, headers, body, etc.)
//  * @returns {Promise<any>} - Response data
//  */
// /* eslint-disable no-unused-vars */
// async function makeRequest(url, options = {}) {
//   try {
//     const response = await fetch(url, {
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//       ...options,
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Request failed:', error);
//     throw error;
//   }
// }

// /**
//  * Display a notification message
//  * @param {string} message - Message to display
//  * @param {string} type - Type of message (success, error, info, warning)
//  */
// /* eslint-disable no-unused-vars */
// function showNotification(message, type = 'info') {
//   // Create notification element
//   const notification = document.createElement('div');
//   notification.className = `notification notification-${type}`;
//   notification.textContent = message;
//   notification.style.position = 'fixed';
//   notification.style.top = '20px';
//   notification.style.right = '20px';
//   notification.style.padding = '1rem';
//   notification.style.borderRadius = '4px';
//   notification.style.backgroundColor =
//     type === 'success'
//       ? '#28a745'
//       : type === 'error'
//         ? '#dc3545'
//         : type === 'warning'
//           ? '#ffc107'
//           : '#17a2b8';
//   notification.style.color = 'white';
//   notification.style.zIndex = '1000';
//   notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

//   // Add to page
//   document.body.appendChild(notification);

//   // Remove after 3 seconds
//   setTimeout(() => {
//     notification.remove();
//   }, 3000);
// }

// Export functions if using modules
// export { validateForm, makeRequest, showNotification };
