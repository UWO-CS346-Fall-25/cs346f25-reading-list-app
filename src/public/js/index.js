// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  fillComboBoxes();
  fetchFilterRadios();
  fetchRecommendations();
  const form = document.querySelector('form');
  form.addEventListener('submit', function (e) {
    // e.preventDefault();
    if (validateForm(form)) {
      processForm();
    }
    e.preventDefault();
  });
});

/**
 * Validate a form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} - True if form is valid
 */
function validateForm(form) {
  let isValid = true;
  const filters = form.querySelectorAll('input[list]');
  filters.forEach((filter) => {
    if (filter.value.trim()) {
      const options = filter.nextElementSibling.childNodes;
      let index = 0;
      let validEntry = false
      while(!validEntry && index < options.length) {
        if (options[index].value === filter.value) {
          validEntry = true;
        }
        index++;
      }
      if (!validEntry) {
        showError(filter, 'Invalid selection');
        isValid = false;
      }
    }
    else {
      clearError(filter);
    }
  });
  return isValid;
}

/**
 * Show error message for a filters
 * @param {HTMLElement} filters - Form filters
 * @param {string} message - Error message
 */
function showError(filters, message) {
  // Remove any existing error
  clearError(filters);

  // Get the error element
  const error = filters.nextElementSibling.nextElementSibling;
  error.textContent = message;
  error.style.visibility = 'visible';

  // Add error class to filters
  filters.classList.add('error');
  filters.style.borderColor = 'red';
}

/**
 * Clear error message for a filters
 * @param {HTMLElement} filters - Form filters
 */
function clearError(filters) {
  filters.nextElementSibling.nextElementSibling.style.visibility = 'hidden';
  filters.classList.remove('error');
  filters.style.borderColor = '';
}

/**
 * Processes a filter form
 */
async function processForm() {
  const token = document.getElementsByName("csrf-token")[0].getAttribute('content');
  try { // fetch request to get book list with filters
    let index = 0;
    let pageFilter = -1;
    const pageRadios = document.getElementById('radio-list').childNodes;
    while (pageFilter === null && index < pageRadios.length) {
      if (pageRadios[index].firstChild.checked) {
        pageFilter = pageRadios[index].lastChild.textContent.trim();
      }
      index++;
    }
    if (pageFilter.length === 5) {
      pageFilter = pageFilter.replace('+', '');
    }
    const filters = { author: document.getElementById('author-input').value,
                      genre: document.getElementById('genre-input').value,
                      page_count: pageFilter};
    let response = await fetch('/filter?' + new URLSearchParams(filters).toString());
    console.log(response.ok);
    if (response.status === 201) { // successful filter
      clearList(); // clearing the existing list
      const json = await response.json();
      if (json.success) {
        loadList(false, json.data);
      }
      else { // unable to translate json
        alert("Unable to connect to the database.");
      }
    }
    else { // unable to connect to database
      alert("Unable to connect to the database.");
    }
  }
  catch(error) { // unable to find route to register
    alert("Unable to connect to the database.");
  }
}

/**
 * A function that fills each combo box
 * in the filter form
 */
function fillComboBoxes() {
  document.querySelectorAll('datalist').forEach(dataList => {
    fetchOptions(dataList.id);
  });
}

/**
 * A function that attempts to load all
 * options for a given combo box on the filter form
 */
async function fetchOptions(requestType) {
  try { // attempting the given fetch request
    const response = await fetch('/' + requestType);
    if (response.ok) { // validating fetch request
      const json = await response.json();
      if (json.success) { // validating json translation
        addOptions(false, requestType, json.data);
      }
      else { // loading default options if cannot translate json
        addOptions(true);
      }
    }
    else { // loading default options if database could not be reached
      addOptions(true);
    }
  }
  catch(error) {// loading default options if fetch request could not be completed
    addOptions(true);
  }
}

/**
 * A helper function that builds the
 * a combo box for the filter form
 * @param {object} error - true if default needed, false if not
 * @param {object} requestType - the combo box type to add options to
 * @param {object} options - list of options, null if unable to located list
 */
function addOptions(error, requestType, options) {
  if (error) { // loading default options
    // this is going to need to read the default list from somewhere based on request type
  }
  else {
    const optionsList = document.getElementById(requestType);
    options.forEach(option => { // add each option
      const newOption = document.createElement('option');
      newOption.value = option;
      optionsList.append(newOption);
    });
  }
}

/**
 * A function that creates the page count
 * radio buttons for the filter form
 */
async function fetchFilterRadios() {
  try { // attempting fetch request to get largest number of pages
    const response = await fetch('/pages');
    if (response.ok) { // validating fetch request
      const json = await response.json();
      if (json.success) { // validating json translation
        buildRadios(json.data[0].page_count);
      }
      else { // loading default max pages if cannot translate to json
        buildRadios(1500);
      }
    }
    else { // loading default max pages if database could not be reached
      buildRadios(1500);
    }
  }
  catch(error) { // picking default value
    buildRadios(1500);
  }
}

/**
 * A function that builds the radio buttons
 * for the filter form
 * @param {number} maxNumPages
 */
function buildRadios(maxNumPages) {
  let radioValue = 150;
  const radioList = document.getElementById('radio-list');
  while(radioValue < maxNumPages) {
    const button = document.createElement('span');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = radioList.id;
    radio.classList.add('radio');
    if (radioValue + 150 < maxNumPages) {
      button.append(radio, " " + radioValue);
    }
    else {
      button.append(radio, " " + radioValue + "+");
    }
    radioList.append(button);
    radioValue += 150;
  }
}

/**
 * A function that attempts to load all
 * recommendations to the recommendations
 * sections of the page
 */
async function fetchRecommendations() {
  try { // attempting fetch request to get recommended list
    const response = await fetch('/recommended');
    if (response.ok) { // validating fetch request
      const json = await response.json();
      if (json.success) { // validating json translation
        loadList(false, json.data);
      }
      else { // loading default list if cannot translate to json
        loadList(true);
      }
    }
    else { // loading default list if database could not be reached
      loadList(true);
    }
  }
  catch(error) { // loading default list if fetch request could not be completed
    loadList(true);
  }
}

/**
 * A helper function that builds the
 * recommended list of books for the
 * landing page
 * @param {object} error - true if default needed, false if not
 * @param {object} recommendations - list of recommendations, null if unable to located list
 */
function loadList(error, recommendations) {
  if (error) { // loading default list
    list = [{title: "Book", author: "Arthur Waldman"}];
  }
  const recommendedList = document.getElementById("books");
  recommendations.forEach(element => { // building a visual book object
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    const li = document.createElement('li');
    const book = document.createElement('div');
    book.classList.add('book');
    const leftSpacer = document.createElement('div');
    leftSpacer.classList.add('left-spacer');
    leftSpacer.style.borderColor = color;
    book.append(leftSpacer);
    const center = document.createElement('div');
    center.classList.add('center');
    const title = document.createElement('p');
    title.textContent = element.title;
    center.append(title);
    const author = document.createElement('p');
    author.textContent = element.author;
    center.append(author);
    book.append(center);
    const rightSpacer = document.createElement('div');
    rightSpacer.classList.add('right-spacer');
    const button = document.createElement('button');
    button.textContent = '+';
    button.title = 'Add to bookshelf';
    rightSpacer.append(button);
    rightSpacer.style.borderColor = color;
    book.append(rightSpacer);
    li.append(book);
    recommendedList.append(li);
  });
}

function clearList() {
  document.getElementById("books").innerHTML = '';
}
