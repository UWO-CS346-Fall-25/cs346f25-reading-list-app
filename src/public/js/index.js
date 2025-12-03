/**
 * Index JavaScript File
 *
 * This file contains functions used by the index view
 * to enrich the user's landing page experience
 *
 * Primary tasks:
 * - show visitors up to 100 books that users are currently reading
 * - offer filtering options for those 100 books
 * - the ability to add books directly to a user's bookshelf if they are logged in
 */
let resolvePromise;

// Adding listeners to performs above tasks when the DOM loads
document.addEventListener('DOMContentLoaded', function () {
  configureCustomAlert();
  calibrateModal();
  fillComboBoxes();
  fetchFilterRadios();
  initFormValidation();
  fetchTrending();
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
 * A function that adds listeners to
 * close the modal window when the close
 * button or empty space is clicked
 */
function calibrateModal() {
  const modalWindow = document.getElementById('popup');
  modalWindow.addEventListener('click', function (e) { // empty space listener
    if (e.target == modalWindow) {
      modalWindow.style.display = 'none';
      document.getElementById('book-list').innerHTML = '';
    }
  });
  const closeButton = document.getElementById('close');
  closeButton.addEventListener('click', function () { // close button listener
    modalWindow.style.display = 'none';
    document.getElementById('book-list').innerHTML = '';
  });
}

/**
 * A function that fills each combo box
 * in the filter form
 */
function fillComboBoxes() {
  document.querySelectorAll('datalist').forEach((dataList) => {
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
      } else { // loading default options if cannot translate json
        addOptions(true);
      }
    } else { // loading default options if database could not be reached
      addOptions(true);
    }
  } catch (error) { // loading default options if fetch request could not be completed
    addOptions(true);
  }
}

/**
 * A helper function that builds the
 * a combo box for the filter form
 * @param {object} error - false if options could not be located, true if they could
 * @param {object} requestType - the combo box type to add options to
 * @param {object} options - list of options, null if unable to located list
 */
function addOptions(error, requestType, options) {
  if (!error) {// loading default options
    const optionsList = document.getElementById(requestType);
    options.forEach((option) => {// add each option
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
  try {
    // attempting fetch request to get largest number of pages
    const response = await fetch('/pages');
    if (response.ok) {
      // validating fetch request
      const json = await response.json();
      if (json.success) {
        // validating json translation
        buildRadios(json.data);
      } else {
        // loading default max pages if cannot translate to json
        buildRadios(1500);
      }
    } else {
      // loading default max pages if database could not be reached
      buildRadios(1500);
    }
  } catch (error) {
    // picking default value
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
  if (radioValue < maxNumPages) {
    while (radioValue < maxNumPages) {
      const button = document.createElement('span');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = radioList.id;
      radio.classList.add('radio');
      button.append(radio, ' ' + radioValue);
      radioList.append(button);
      radioValue += 150;
    }
  }
  else {
    const button = document.createElement('span');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = radioList.id;
    radio.classList.add('radio');
    button.append(radio, ' ' + maxNumPages);
    radioList.append(button);
  }
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
 * Validate a form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} - True if form is valid
 */
function validateForm(form) {
  let isValid = true; // local bool to support one-way-in out-way-out structure
  const filters = form.querySelectorAll('input[list]'); // retrieving filter fields
  filters.forEach((filter) => { // validating each filter
    if (filter.value.trim()) {
      const options = filter.nextElementSibling.childNodes;
      let index = 0;
      let validEntry = false;
      while (!validEntry && index < options.length) { // checking the entered filter is a valid filter option
        if (options[index].value === filter.value) {
          validEntry = true;
          clearError(filter);
        }
        index++;
      }
      if (!validEntry) { // letting user know their filter option is invalid
        showError(filter, 'Invalid selection');
        isValid = false;
      }
    } else { // clearing error message on valid filter
      clearError(filter);
    }
  });
  return isValid; // returning form validity
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
  const author = document.getElementById('author-input'); // retrieving author
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
    const filters = { // creating fetch params
      author: author.value,
      page_count: pageFilter
    };
    let response = await fetch( // attempting fetch for matching filters
      // eslint-disable-next-line no-undef -- file is registering the code below as an error
      '/filter?' + new URLSearchParams(filters).toString()
    );
    if (response.status === 201) { // successful filter
      clearList(); // clearing the existing list
      const json = await response.json(); // extracting new list
      if (json.success) { // checking if the extraction was successful
        loadList(false, json.data); // loading the trending list with filter options
      } else { // unable to translate json
        await customAlert('Unable to connect to the database.');
      }
    } else { // unable to connect to database
      await customAlert('Unable to connect to the database.');
    }
  } catch (error) { // unable to find route to register
    await customAlert('Unable to connect to the database.');
  }
  finally { // clearing filter fields
    document.querySelector('form').reset();
  }
}

/**
 * A function that attempts to load trending books
 */
async function fetchTrending() {
  try {
    // attempting fetch request to get trending list
    const response = await fetch('/trending');
    if (response.ok) {
      // validating fetch request
      const json = await response.json();
      if (json.success) {
        // validating json translation
        loadList(false, json.data);
      } else {
        // loading default list if cannot translate to json
        loadList(true);
      }
    } else {
      // loading default list if database could not be reached
      loadList(true);
    }
  } catch (error) {
    // loading default list if fetch request could not be completed
    loadList(true);
  }
}

/**
 * A helper function that builds the
 * recommended list of books for the
 * landing page
 * @param {object} error - true if default needed, false if not
 * @param {object} trending - list of trending books
 */
function loadList(error, trending) {
  const trendingList = document.getElementById('books');
  if (!error) { // checking for error loading book list
    trending.forEach((element) => { // building a visual book object
      const color = getRandomColor(); // getting random color for each book
      const li = document.createElement('li'); // creating each list item
      const book = document.createElement('div'); // creating each book object
      book.classList.add('book');
      const leftSpacer = document.createElement('div'); // creating the left spacer of each book
      leftSpacer.classList.add('left-spacer');
      leftSpacer.style.borderColor = color;
      book.append(leftSpacer);
      const center = document.createElement('div'); // creating the center container of each book
      center.classList.add('center');
      const title = document.createElement('p'); // creating the title for the center container
      title.textContent = element.title;
      title.style.maxWidth = '35ch';
      title.style.whiteSpace = 'nowrap';
      title.style.overflow = 'hidden';
      title.style.textOverflow = 'ellipsis';
      center.append(title);
      const authors = element.authors; // creating the author(s) for the center container
      const numAuthors = authors.length;
      const author = document.createElement('p');
      author.textContent = authors[0];
      center.append(author);
      if (numAuthors > 1) {
        const otherAuthors = document.createElement('p');
        otherAuthors.textContent = `+ ${numAuthors} other author(s)`;
        center.append(otherAuthors);
      }
      book.append(center);
      const rightSpacer = document.createElement('div'); // creating the right spacer of each book
      rightSpacer.classList.add('right-spacer');
      const button = document.createElement('button'); // creating the add button for the right spacer
      button.textContent = '+';
      button.title = 'Add to bookshelf';
      button.classList.add('add-button');
      rightSpacer.append(button);
      rightSpacer.style.borderColor = color;
      book.append(rightSpacer);
      li.append(book);
      trendingList.append(li);
    });
    configureOuterAddButtons(); // configuring each add button
  }
  else { // added message saying that books could not be loaded
    trendingList.textContent = "Unable to load books";
    trendingList.style.textAlign = 'center';
  }
}

/**
 * A helper function that clears all the books from the
 * books list
 */
function clearList() {
  document.getElementById('books').innerHTML = '';
}

/**
 * A function that adds a listener to the add button
 * on each book in the trending reads section
 */
function configureOuterAddButtons() {
  const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
  const buttonList = document.querySelectorAll('.add-button'); // getting each add button
  buttonList.forEach((button) => { // looping through each add button
    button.addEventListener('click', async function () { // adding a click listener to each button
      try { // attempting the fetch request for the books selector
        let title = button.parentNode.previousSibling.firstChild.textContent; // getting the book title
        if (title.includes('(')) {
          title = title.substring(0, title.indexOf('('));
        }
        let author = button.parentNode.previousSibling.lastChild; // getting the author(s)
        author = author.textContent.charAt(0) === '+' ? author.previousSibling.textContent : author.textContent;
        let response = await fetch('selector', { // get fetch for books selector
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': token,
          },
          body: JSON.stringify({ title: title, author: author }),
        });
        if (response.status === 201) { // book added successfully
          const json = await response.json();
          if (json.success) { // validating json translation
            const popup = document.getElementsByClassName('modal');
            popup[0].style.display = 'block';
            buildBookSelector(json.data); // building the book selector
          } else { // unable to translate json
            await customAlert('Error! Please try again');
          }
        }
        else if (response.status === 404) { // cannot add book, no user logged in
          await customAlert('Please log in to add books to your bookshelf');
        }
        else { // unable to make call to API
          await customAlert('Network error. Please try again later');
        }
      } catch (error) { // unable to access the database
        await customAlert('Network error. Please try again later');
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
  const bookModal = document.getElementById('book-list');
  books.forEach((book) => {
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
    // creating of isbn section
    const isbnSection = document.createElement('div');
    isbnSection.classList.add('isbn-section');
    const isbn = document.createElement('p');
    isbn.textContent = 'ISBN';
    isbn.style.textDecoration = 'underline';
    isbnSection.append(isbn);
    const bookISBN = document.createElement('p');
    bookISBN.textContent = book.isbn;
    bookISBN.style.fontSize = '11px';
    isbnSection.append(bookISBN);
    displayBook.append(isbnSection);
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
    book.authors.forEach((author) => {
      const bookAuthor = document.createElement('p');
      bookAuthor.textContent = author;
      bookAuthor.style.fontSize = '11px';
      authorSection.append(bookAuthor);
    });
    displayBook.append(authorSection);
    // creation of page count section
    const pageCountSection = document.createElement('div');
    pageCountSection.classList.add('page-count-section');
    const pageCount = document.createElement('p');
    pageCount.textContent = 'Page Count';
    pageCount.style.textDecoration = 'underline';
    pageCountSection.append(pageCount);
    const bookPageCount = document.createElement('p');
    bookPageCount.textContent = book.pageCount;
    bookPageCount.style.fontSize = '11px';
    pageCountSection.append(bookPageCount);
    displayBook.append(pageCountSection);
    // creation of button section
    const buttonSection = document.createElement('div');
    buttonSection.classList.add('button-section');
    const button = document.createElement('button');
    button.textContent = 'Add';
    button.id = 'add-button';
    configureInnerAddButton(bookISBN.textContent, bookTitle.textContent, book.authors, bookPageCount.textContent, button);
    buttonSection.append(button);
    displayBook.append(buttonSection);
    // putting everything together
    bookItem.append(displayBook);
    bookModal.append(bookItem);
  });
}

/**
 * A function that adds a selected book to the users
 * to-read bookshelf
 * @param {object} title
 * @param {object} authors
 * @param {object} addButton
 */
async function configureInnerAddButton(isbn, title, authors, pageCount, addButton) {
  try {
    const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
    const modalWindow = document.getElementById('popup');
    addButton.addEventListener('click', async function () { // adding click listener to each inner add button
      let response = await fetch('add_to_shelf', { // fetch to add book to user bookshelf
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': token,
        },
        body: JSON.stringify({
          isbn: isbn,
          title: title,
          authors: authors,
          pageCount: pageCount
        }),
      });
      if (response.status === 201) { // book was successfully added
        await customAlert(`${title} was added to your bookshelf`);
        document.getElementById('book-list').innerHTML = '';
        modalWindow.style.display = 'none';
      } else if (response.status === 403) { // user is not logged in and can't add the book
        await customAlert('Please log in to add books to your bookshelf');
      } else if (response.status === 409) { // the book already exists on the user's bookshelf
        await customAlert(`${title} is already on your bookshelf`);
      } else { // the database could not complete the add
        await customAlert('Network error! Please try again');
      }
    });
  }
  catch (error) {  // the database could not be accessed
    await customAlert('Network error! Please try again');
  }
}

/**
 * A helper function that returns a random color for books
 * @returns a random color as a string
 */
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}
