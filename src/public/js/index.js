// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  calibrateModal();
  fillComboBoxes();
  fetchFilterRadios();
  initFormValidation();
  fetchRecommendations();
});

/**
 * A function that adds listeners to
 * close the modal window when the close
 * button or empty space is clicked
 */
function calibrateModal() {
  const modalWindow = document.getElementById('popup');
  modalWindow.addEventListener('click', function(e) { // empty space listener
    if (e.target == modalWindow) {
      modalWindow.style.display = 'none';
      document.getElementById("book-list").innerHTML = '';
    }
  });
  const closeButton = document.getElementById('close');
  closeButton.addEventListener('click', function () { // close button listener
    modalWindow.style.display = 'none';
    document.getElementById("book-list").innerHTML = '';
  });
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
  const filters = form.querySelectorAll('input[list]');
  filters.forEach((filter) => {
    if (filter.value.trim()) {
      const options = filter.nextElementSibling.childNodes;
      let index = 0;
      let validEntry = false
      while(!validEntry && index < options.length) {
        if (options[index].value === filter.value) {
          validEntry = true;
          clearError(filter);
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
    while (pageFilter === -1 && index < pageRadios.length) {
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
    recommendations = [{ title: 'Book', author: 'Arthur Waldman' }];
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
    button.classList.add('add-button');
    rightSpacer.append(button);
    rightSpacer.style.borderColor = color;
    book.append(rightSpacer);
    li.append(book);
    recommendedList.append(li);
  });
  configureOuterAddButtons();
}

/**
 * A helper function that clears all the books form the
 * books list
 */
function clearList() {
  document.getElementById("books").innerHTML = '';
}
 /**
  * A function that adds a listener to the add button
  * on each book in the user recommendations sections
  */
function configureOuterAddButtons() {
  const token = document.getElementsByName("csrf-token")[0].getAttribute('content');
  const buttonList = document.querySelectorAll('.add-button');
  buttonList.forEach(button => {
    button.addEventListener('click', async function() {
      try{
        const title = button.parentNode.previousSibling.firstChild.textContent;
        const author = button.parentNode.previousSibling.lastChild.textContent;
        let response = await fetch('add',
                                  { method: 'POST',
                                    headers: {
                                    'Content-Type': 'application/json',
                                    'CSRF-Token': token},
                                    body: JSON.stringify({ title: title, author: author })
                                  });
        if (response.status === 201) { // book added successfully
          const json = await response.json();
          if (json.success) { // validating json translation
            const popup = document.getElementsByClassName('modal');
            popup[0].style.display = 'block';
            buildBookSelector(json.data); // building the book selector
          }
          else { // loading default list if cannot translate to json
            alert("Error! Please try again");
          }
        }
        else if (response.status === 404) { // cannot add book, no user logged in
          alert("Please log in to add books to your bookshelf");
        }
        else { // unable to access the database
          alert("Network error. Please try again later");
        }
      }
      catch(error) { // unable to access the database
        alert("Network error. Please try again later");
      }
    });
  });
}

/**
 * A helper function that builds the book selector
 * for when a user wants to add a book to their bookshelf
 * @param {object} books
 */
function buildBookSelector(books) {
  const targetLocation = document.getElementById('book-list');
  books.forEach(book => {
    const bookItem = document.createElement('li');
    const displayBook = document.createElement('div');
    displayBook.classList.add('display-book');
    // created of image section
    const imageSection = document.createElement('div');
    imageSection.classList.add('image-section');
    const image = document.createElement('img');
    image.src = book.cover;
    image.height = 94;
    image.alt = book.title;
    imageSection.append(image);
    displayBook.append(imageSection);
    // creation of title section
    const titleSection = document.createElement('div');
    titleSection.classList.add('title-section');
    const title = document.createElement('p');
    title.textContent = 'Title';
    title.style.textDecoration = 'underline';
    titleSection.append(title);
    const bookTitle = document.createElement('p');
    bookTitle.textContent = book.title;
    bookTitle.style.fontSize = '11px';
    titleSection.append(bookTitle);
    displayBook.append(titleSection);
    // creation of authors section
    const authorSection = document.createElement('div');
    authorSection.classList.add('author-section');
    const author = document.createElement('p');
    author.textContent = 'Author(s)';
    author.style.textDecoration = 'underline';
    authorSection.append(author);
    book.authors.forEach(author => {
      const bookAuthor = document.createElement('p');
      bookAuthor.textContent = author;
      bookAuthor.style.fontSize = '11px';
      authorSection.append(bookAuthor);
    });
    displayBook.append(authorSection);
    // creation of button section
    const buttonSection = document.createElement('div');
    buttonSection.classList.add('button-section');
    const button = document.createElement('button');
    button.textContent = 'Add';
    button.id = 'add-button'
    configureInnerAddButton(bookTitle.textContent, book.authors, button);
    buttonSection.append(button);
    displayBook.append(buttonSection);
    // putting everything together
    bookItem.append(displayBook);
    targetLocation.append(bookItem);
  });
}

/**
 * A function that adds a selected book to the users
 * to-read bookshelf
 * @param {object} title
 * @param {object} authors
 * @param {object} addButton
 */
function configureInnerAddButton(title, authors, addButton) {
  const modalWindow = document.getElementById('popup');
  try {
    const token = document
      .getElementsByName('csrf-token')[0]
      .getAttribute('content');
    addButton.addEventListener('click', async function () {
      let response = await fetch('addbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': token,
        },
        body: JSON.stringify({
          title: title,
          authors: authors,
        }),
      });
      if (response.status === 201) {
        alert(`${title} was added to your bookshelf`);
        document.getElementById('book-list').innerHTML = '';
        modalWindow.style.display = 'none';
      }
      else if (response.status === 403) {
        alert("Please log in to add books to your bookshelf");
      }
      else if (response.status === 409) {
        alert(`${title} is already on your bookshelf`);
      }
      else {
        alert('Network error! Please try again');
      }
    });
  }
  catch(error) {
    alert("Network error! Please try again");
  }
}
