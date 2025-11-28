/**
 * Bookshelf JavaScript File
 *
 * This file contains functions used by the bookshelf view
 * to control a user's bookshelf
 *
 * Primary tasks:
 * - load user's books
 * - control the addition, moving, and deletion of books
 */

var draggedBook; // global book used for drag and drop event handler

// Setting up bookshelves, add and move modals, and delete buttons when the DOM loads
document.addEventListener('DOMContentLoaded', async function () {
  await loadBooks();
  bookDropdown();
  setupAddBookModal();
  calibrateModal();
  clearShelfModal();
  setupMoveBookModal();

  // Find and attach the delete button listener
  // We need to give your delete link an ID
  const deleteBtn = document.getElementById('delete-book-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // deleteBook();
    });
  }
});

/**
 * A function that loads the user's books to their bookshelves
 */
async function loadBooks() {
  const bookShelves = document.getElementsByClassName('book-column'); // getting each bookshelf
  for (const bookShelf of bookShelves) { // adding books one shelf at a time
    try { // attempting to fetch each bookshelf's books
      let routePath = bookShelf.id === 'to-read' ? 'toread' : bookShelf.id; // handing first bookshelf
      let result = await fetch(`/${routePath}`); // making get fetch for books
      if (result.ok) { // validating the fetch result
        const json = await result.json(); // translating book data to json
        if (json.success) { // validating the json translation was successful
          loadList(bookShelf.lastElementChild, json.data); // loading the list of json books
        } else { // json translation unsuccessful
          loadEmptyShelf(bookShelf.lastElementChild);
        }
      } else { // unable to fetch a bookshelf's books
        loadEmptyShelf(bookShelf.lastElementChild);
      }
    } catch (error) { // unable to connect to database
      loadEmptyShelf(bookShelf.lastElementChild);
    }
  }
  dragBooks(); // configuring each book to drag
}

/**
 * A function that adds an error message when books could not be loaded for a bookshelf
 * @param {object} bookshelf the bookshelf whose books could not be loaded
 */
function loadEmptyShelf(bookshelf) {
  bookshelf.style.textAlign = 'center';
  bookshelf.textContent = 'Unable to load books. Please refresh and try again.';
}

/**
 * A helper function that builds the user's bookshelves
 * @param {object} bookShelf - the shelf to be added to
 * @param {object} bookList - a list of books
 */
function loadList(bookShelf, bookList) {
  bookList.forEach((element) => { // building a visual book object
    const color = getRandomColor(); // getting a random color for each book
    const li = document.createElement('li'); // creating each list item
    const book = document.createElement('div'); // creating each book object
    book.classList.add('book');
    const leftSpacer = document.createElement('div'); // creating the left spacer of each book
    leftSpacer.classList.add('left-spacer');
    leftSpacer.style.borderColor = color;
    book.append(leftSpacer);
    const center = document.createElement('div'); // creating the center container of each book
    center.classList.add('center');
    const bookId = document.createElement('p'); // creating the bookId for the center container
    bookId.textContent = element[Object.keys(element)[0]];
    bookId.style.display = 'none'; // hiding the bookId to use a silent database hook
    center.append(bookId);
    const title = document.createElement('p'); // creating the title for the center container
    title.textContent = element.title;
    title.style.maxWidth = '25ch';
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
    const button = document.createElement('button'); // creating the delete button for the right spacer
    button.title = 'Delete';
    button.classList.add('delete-button');
    const trash = document.createElement('img');
    trash.src = '/images/trash_can.png';
    trash.alt = 'Trash';
    trash.width = 25;
    button.append(trash);
    rightSpacer.append(button);
    rightSpacer.style.borderColor = color;
    book.append(rightSpacer);
    li.append(book);
    li.draggable = true;
    bookShelf.append(li);
    configureDeleteButton(button); // configuring each delete button
    li.addEventListener('dragstart', function () {
      draggedBook = li;
    });
  });
}

/**
 * A function that removes a book from a bookshelf, and if it works, removes it from the DOM
 * @param {object} button the delete button clicked
 */
function configureDeleteButton(button) {
  const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
  button.addEventListener('click', async function () { // adding a click listener to each delete button
    const bookId = button.parentElement.previousSibling.firstChild.textContent; // retrieving silent database hook
    const bookshelf = button.parentElement.parentElement.parentElement.parentElement; // retrieving the book's bookshelf
    let response = await fetch('delete', { // attempting delete fetch
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token,
      },
      body: JSON.stringify({ book_id: bookId, bookshelf: bookshelf.id }),
    });
    if (response.status === 201) { // removing book from DOM if delete worked
      bookshelf.removeChild(button.parentElement.parentElement.parentElement);
    } else { // could not delete the book
      alert('Network error! Please try again later.');
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
 * Handles the Manage Books button dropdown event
 */
function bookDropdown() {
  const manageBtn = document.getElementById('manage-books');
  const dropdownMenu = document.getElementById('books-dropdown-menu');
  manageBtn.addEventListener('click', () => { // Clicking toggles the dropdown
    dropdownMenu.classList.toggle('show');
  });
  window.addEventListener('click', (event) => { // If the user clicks outside, close it
    if (!event.target.matches('#manage-books')) {
      if (dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
      }
    }
  });
}

/**
 * A function that makes each book draggable and performs the needed functions
 * to ensure books are moved to the correct tables when dragged
 */
function dragBooks() {
  const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
  const bookshelves = document.getElementsByClassName('bookshelf');
  for (const shelf of bookshelves) { // retrieving each bookshelf
    shelf.addEventListener('dragover', function (e) { // forcing drag over action on bookshelves
      e.preventDefault();
    });
    shelf.addEventListener('drop', async function (e) { // allowing books to be dropped into bookshelves
      e.preventDefault();
      const originShelf = draggedBook.parentElement;
      if (originShelf.id !== shelf.id) { // only moving a book if the book was dragged from one shelf to a different shelf
        const spinner = document.getElementsByClassName('spinner-container')[0];
        const shelvesContainer = shelf.parentElement.parentElement;
        shelvesContainer.style.opacity = 0.5;
        shelvesContainer.style.pointerEvents = 'none';
        spinner.style.display = 'block';
        shelf.append(draggedBook);
        const bookId = draggedBook.childNodes[0].childNodes[1].childNodes[0].textContent;
        let response = await fetch('move', { // fetching for a move [insert -> delete]
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': token,
          },
          body: JSON.stringify({
            book_id: bookId,
            start: originShelf.id,
            end: shelf.id,
          }),
        });
        if (response.status === 201) { // replacing book id if the move worked
          const json = await response.json();
          if (json.success) { // parsing new book id
            draggedBook.childNodes[0].childNodes[1].childNodes[0].textContent = json.data;
            shelvesContainer.style.opacity = 1;
            shelvesContainer.style.pointerEvents = 'all';
            spinner.style.display = 'none';
          } else { // could not parse new id, reloading page so the id updates
            window.location.reload();
          }
        } else if (response.status === 409) { // insert worked, but the delete failed
          alert('The move failed. The book may now appear on both shelves.');
          window.location.reload();
        } else { // failed to locate book or insert
          alert('Could not complete the move. Please try again later.');
          window.location.reload();
        }
      }
    });
  }
}

/**
 * Handles the form submission and buttons for adding a book
 */
function setupAddBookModal() {
  const modal = document.getElementById('addBookModal');
  const addLink = document.querySelector('.dropdown-link:nth-child(1)'); // "Add" link
  const closeBtn = modal.querySelector('.close');
  const form = document.getElementById('addBookForm');

  addLink.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  //handle form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    //call addBookToShelf to perform the fetch
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const bookshelfTable = document.getElementById('book-status').value;
    const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
    try {
      let response = await fetch('addtoselector', {
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
          const popup = document.getElementById('popup');
          modal.style.display = 'none';
          popup.style.display = 'block';
          buildBookSelector(json.data, bookshelfTable); // building the book selector
        } else { // could not translate book list to json
          alert('Network error! Please try again later');
        }
      } else if (response.status === 404) { // could not retrieve book list from API
        alert('Please log in to add books to your bookshelf');
      } else { // unable to access the database
        alert('Network error. Please try again later');
      }
    }
    catch (error) { // unable to complete fetch request
      alert(error.message);
    }
    finally { // resetting the form
      form.reset();
    }
  });
}

/**
 * A helper function that builds the book selector
 * for when a user wants to add a book to their bookshelf
 * @param {object} books the list of books the user can choose from
 * @param {object} bookshelfTable the table to have the book added to
 */
function buildBookSelector(books, bookshelfTable) {
  const targetLocation = document.getElementById('book-list');
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
    // creation of button section
    const buttonSection = document.createElement('div');
    buttonSection.classList.add('button-section');
    const button = document.createElement('button');
    button.textContent = 'Add';
    button.id = 'add-button';
    configureInnerAddButton(
      bookTitle.textContent,
      book.authors,
      button,
      bookshelfTable
    );
    buttonSection.append(button);
    displayBook.append(buttonSection);
    // putting everything together
    bookItem.append(displayBook);
    targetLocation.append(bookItem);
  });
}

/**
 * A function that adds a selected book to the user's requested bookshelf
 * @param {object} title the book title
 * @param {object} authors the book authors
 * @param {object} addButton the add button
 * @param {object} bookshelfTable the table to be added to
 */
function configureInnerAddButton(title, authors, addButton, bookshelfTable) {
  const modalWindow = document.getElementById('popup');
  try {
    const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
    addButton.addEventListener('click', async function () { // setting click listener to add a book
      let response = await fetch('addbooktoshelf', { // attempting insert fetch
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': token,
        },
        body: JSON.stringify({
          title: title,
          authors: authors,
          table: bookshelfTable,
        }),
      });
      if (response.status === 201) { // insert worked, adding book in real time if possible or refreshing page
        document.getElementById('book-list').innerHTML = '';
        modalWindow.style.display = 'none';
        const json = await response.json(); // translating book data to json
        if (json.success) { // if the book id is available, loading book in real time
          const book = json.data;
          book.title = title;
          book.authors = authors;
          loadList(document.getElementById(bookshelfTable), [book]);
        } else { // reloading the page if cannot add book in real time
          window.location.reload();
        }
      } else if (response.status === 403) { // user is no longer logged in
        alert('Please log in to add books to your bookshelf');
      } else if (response.status === 409) { // the book already exist in the bookshelf
        alert(`${title} is already on your bookshelf`);
      } else { // the insert could not be completed
        alert('Network error! Please try again');
      }
    });
  } catch (error) { // network error
    alert('Network error! Please try again');
  }
}

/**
 * Controls the clear shelf modal's buttons and interaction
 */
function clearShelfModal() {
  const modal = document.getElementById('clear-shelf-modal');
  const confirmBtn = document.getElementById('confirm-clear-shelf');
  const cancelBtn = document.getElementById('cancel-clear-shelf');
  const closeSpan = modal.querySelector('.close');
  const clearButtons = document.querySelectorAll('.clear-shelf-btn');

  let currShelf = null;

  clearButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      currShelf = btn.getAttribute('data-shelf');
      console.log('Opening modal for shelf:', currShelf);
      modal.style.display = 'block';
    });
  });

  const closeModal = () => {
    modal.style.display = 'none';
    currShelf = null;
  };

  cancelBtn.addEventListener('click', closeModal);
  closeSpan.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  confirmBtn.addEventListener('click', async () => {
    if (currShelf) {
      await clearShelf(currShelf);
    }
    closeModal();
  });
}

/**
 * Helper function for clearShelfModal
 * Performs the Delete call using the user's token and the shelf they wish to clear
 * @param {*} currShelf
 */
async function clearShelf(currShelf) {
  const token = document
    .getElementsByName('csrf-token')[0]
    .getAttribute('content');

  try {
    const response = await fetch('/clear', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token,
      },
      body: JSON.stringify({ bookshelf: currShelf }),
    });

    if (!response.ok) {
      //failed to clear from DB
      console.error('Failed to clear shelf:', response.status);
      alert('Failed to clear shelf. Please try again.');
      return;
    }

    // At this point, DB delete succeeded, now clear the DOM
    const listElement = document.getElementById(currShelf);

    if (listElement) {
      listElement.innerHTML = '';
    } else {
      alert('Attempt to clear shelf failed.');
    }
  } catch (error) {
    console.error('Error clearing shelf:', error);
    alert('Network error. Please try again.');
  }
}

function setupMoveBookModal() {
  const modal = document.getElementById('move-modal');
  const form = document.getElementById('move-book-form');
  const closeBtn = modal.querySelector('.close');

  const fromSelect = document.getElementById('move-from-shelf');
  const toSelect = document.getElementById('move-to-shelf');
  const titleInput = document.getElementById('move-book-title');
  const titleDropdown = document.getElementById('move-title-dropdown');

  // shelves
  const shelves = [
    { value: 'to-read-books', label: 'To Read' },
    { value: 'reading-books', label: 'Reading' },
    { value: 'finished-books', label: 'Finished' },
  ];

  // open modal from Manage Books
  const moveLink = document.getElementById('move-book-link');
  if (moveLink) {
    moveLink.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'block';
    });
  }

  function resetFormState() {
    form.reset();
    toSelect.disabled = true;
    titleInput.disabled = true;
    titleDropdown.innerHTML = '';
    titleDropdown.classList.add('hidden');
    toSelect.innerHTML =
      '<option value="" disabled selected>Select a shelf</option>';
  }

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    resetFormState();
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      resetFormState();
    }
  });

  // From input form
  fromSelect.addEventListener('change', () => {
    const fromValue = fromSelect.value;

    if (!fromValue) {
      resetFormState();
      return;
    }

    // enable the other two inputs
    toSelect.disabled = false;
    titleInput.disabled = false;

    // build To options: every shelf except the selected From
    toSelect.innerHTML =
      '<option value="" disabled selected>Select a shelf</option>';
    shelves
      .filter((s) => s.value !== fromValue)
      .forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.value;
        opt.textContent = s.label;
        toSelect.appendChild(opt);
      });

    // clear any previous title list
    titleDropdown.innerHTML = '';
    titleDropdown.classList.add('hidden');
  });

  // Helper: get all book titles from a shelf (assumes <ul id="..."> with <li>Book Title</li>)
  function getTitlesForShelf(shelfId) {
    const shelf = document.getElementById(shelfId);
    if (!shelf) return [];

    const titles = [];

    // each li has a div.book > div.center with several <p> tags
    const centers = shelf.querySelectorAll('.book .center');

    centers.forEach((center) => {
      const ps = center.querySelectorAll('p');
      // ps[0] = "BookID: ...", ps[1] = title
      if (ps.length >= 2) {
        const titleText = ps[1].textContent.trim();
        if (titleText && !titles.includes(titleText)) {
          titles.push(titleText);
        }
      }
    });

    return titles;
  }

  //show the list of books ---
  titleInput.addEventListener('focus', () => {
    const fromValue = fromSelect.value;
    if (!fromValue) {
      alert('Select a "From shelf" first.');
      fromSelect.focus();
      return;
    }

    const titles = getTitlesForShelf(fromValue);
    titleDropdown.innerHTML = '';

    if (titles.length === 0) {
      //Handle empty column
      const emptyMsg = document.createElement('div');
      emptyMsg.classList.add('title-dropdown-item');
      emptyMsg.textContent = 'No books in this shelf.';
      titleDropdown.appendChild(emptyMsg);
    } else {
      titles.forEach((title) => {
        const item = document.createElement('div');
        item.classList.add('title-dropdown-item');
        item.textContent = title;
        item.addEventListener('click', () => {
          titleInput.value = title;
          titleDropdown.classList.add('hidden');
        });
        titleDropdown.appendChild(item);
      });
    }

    titleDropdown.classList.remove('hidden');
  });

  // Hide dropdown if user clicks somewhere else
  document.addEventListener('click', (e) => {
    if (!titleDropdown.contains(e.target) && e.target !== titleInput) {
      titleDropdown.classList.add('hidden');
    }
  });

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const start = fromSelect.value;
    const end = toSelect.value;
    const title = titleInput.value.trim();

    if (!start || !end || !title) {
      alert('Please fill out all fields.');
      return;
    }

    if (start === end) {
      alert('The starting and ending shelf must be different.');
      return;
    }

    const token = document
      .getElementsByName('csrf-token')[0]
      .getAttribute('content');

    try {
      const response = await fetch('move-btn', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': token,
        },
        body: JSON.stringify({ title, start, end }),
      });

      if (response.status === 201) {
        const json = await response.json();
        if (json.success) {
          alert(`"${title}" was moved successfully.`);
        } else {
          alert('Move completed, reloading your bookshelf.');
        }
        window.location.reload();
      } else if (response.status === 404) {
        alert('Could not find that book on the specified starting shelf.');
      } else if (response.status === 409) {
        alert('Move failed due to a conflict.');
        window.location.reload();
      } else {
        alert('Could not complete the move. Please try again later.');
      }
    } catch (error) {
      console.error('Error moving book:', error);
      alert('Network error. Please try again later.');
    } finally {
      modal.style.display = 'none';
      resetFormState();
    }
  });
}

/**
 * A helper function that returns a random color for books
 * @returns a random color as a string
 */
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}
