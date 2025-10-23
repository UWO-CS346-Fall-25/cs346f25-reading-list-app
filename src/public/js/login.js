// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  const token = document.getElementsByName("csrf-token")[0].getAttribute('content'); // csrf-token for security
  const button = document.getElementById("login"); // login button
  try { // fetch request to add register a user
    button.addEventListener('click', async () => {
      let response = await fetch('/validate_login',
                                { method: 'PUT',
                                  headers: {
                                  'Content-Type': 'application/json',
                                  'CSRF-Token': token},
                                  body: JSON.stringify({ email: document.getElementById("email").value,
                                                         password: document.getElementById("password").value}),
                                });
      if (response.status === 201) { // successful register
        window.location.href = '/bookshelf';
      }
    //   else if (response.status === 409) { // existing email address
    //     alert("An account already exists with this email!");
    //   }
    //   else { // unable to connect to database
    //     alert("Account registration error. Please try again later.");
    //   }
    });
  }
  catch(error) { // unable to find route to register
    alert("Account registration error. Please try again later.");
  }
});