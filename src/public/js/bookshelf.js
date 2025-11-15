/**
 * All of the functions required for functionality of bookshelf including:
 * - Manage Book's dropdown
 * - Handling the Manage Books button features: add, delete, change, move
 * - Dragging each book
 *
 */

/**
 * Load the DOM content
 */
document.addEventListener('DOMContentLoaded', async function () {
  await loadBooks();
  bookDropdown();
  dragBooks();
  handleBookSelection();
  setupAddBookModal();
  calibrateModal();
  clearShelfModal();

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
 * A function that loads the user's books
 * into their bookshelves
 */
async function loadBooks() {
  const bookShelves = document.getElementsByClassName('book-column');
  for (const bookShelf of bookShelves) {
    try {
      let routePath = bookShelf.id === 'to-read' ? 'toread' : bookShelf.id;
      let result = await fetch(`/${routePath}`);
      if (result.ok) {
        const json = await result.json();
        if (json.success) {
          loadList(bookShelf.lastElementChild, json.data);
        } else {
          alert('unable to parse data');
        }
      } else {
        alert('network error!');
      }
    }
    catch (error) {
      alert("network error!");
    }
  }
}

/**
 * A helper function that builds the
 * user's bookshelves
 * @param {object} bookShelf - the shelf to be added to
 * @param {object} bookList - a list of books
 */
function loadList(bookShelf, bookList) {
  bookList.forEach((element) => { // building a visual book object
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
    const bookId = document.createElement('p');
    bookId.textContent = 'BookID: ' + element[Object.keys(element)[0]];
    bookId.style.fontSize = '7px';
    center.append(bookId);
    const title = document.createElement('p');
    title.textContent = element.title;
    center.append(title);
    const authors = element.authors;
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
    const rightSpacer = document.createElement('div');
    rightSpacer.classList.add('right-spacer');
    const button = document.createElement('button');
    button.title = 'Delete';
    button.classList.add('delete-button');
    const trash = document.createElement('img');
    trash.src = "/images/trash_can.png";
    trash.alt = "Trash"
    trash.width = 25;
    button.append(trash);
    rightSpacer.append(button);
    rightSpacer.style.borderColor = color;
    book.append(rightSpacer);
    li.append(book);
    li.draggable = true;
    bookShelf.append(li);
    configureDeleteButton(button);
  });
}

/**
 * A function that removes a book from a bookshelf, and if it
 * work, removes it from the DOM
 * @param {object} button
 */
function configureDeleteButton(button) {
  const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
  button.addEventListener('click', async function () {
    const bookId = (button.parentElement.previousSibling.firstChild.textContent).replace('BookID: ', '');
    const bookshelf = button.parentElement.parentElement.parentElement.parentElement;
    let response = await fetch('delete', { // attempting delete fetch
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token,
      },
      body: JSON.stringify({ book_id: bookId, bookshelf: bookshelf.id }),
    });
    if (response.status === 201) { // removing book from DOM is delete worked
      const book = button.parentElement.parentElement.parentElement;
      bookshelf.removeChild(book);
    }
    else { // network error
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
 * Handles the Manage Books button dropdown event
 */
function bookDropdown() {
  const manageBtn = document.getElementById('manage-books');
  const dropdownMenu = document.getElementById('books-dropdown-menu');

  //Clicking toggles the dropdown
  manageBtn.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
  });

  //If the user clicks outside, close it
  window.addEventListener('click', (event) => {
    if (!event.target.matches('#manage-books')) {
      if (dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
      }
    }
  });
}

/**
 * Makes each book draggable and performs the needed functions
 * to ensure books are moved to the correct tables when dragged
 */
function dragBooks() {
  const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
  const bookshelves = document.getElementsByClassName('bookshelf');
  let draggedBook = null;
  for (const shelf of bookshelves) { // targeting all bookshelves
    for (const book of shelf.childNodes) { // targeting all books
      book.addEventListener('dragstart', function () { // storing pointer to each book when dragged
        draggedBook = book;
      });
    }
    shelf.addEventListener('dragover', function (e) { // forcing drag over action on bookshelves
      e.preventDefault();
    });
    shelf.addEventListener('drop', async function (e) { // allowing books to be dropped into bookshelves
      e.preventDefault();
      const originShelf = draggedBook.parentElement;
      if (originShelf.id !== shelf.id) { // only acting if a book was dragged from one shelf to another
        shelf.append(draggedBook);
        const bookId = (draggedBook.childNodes[0].childNodes[1].childNodes[0].textContent).replace('BookID: ', '');
        let response = await fetch('move', { // fetching for a move [insert -> delete]
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': token,
          },
          body: JSON.stringify({ book_id: bookId, start: originShelf.id, end: shelf.id }),
        });
        if (response.status === 409) { // insert worked, but the delete failed
          alert('The move failed. The book may now appear on both shelves.');
          window.location.reload();
        }
        else if (response.status === 500) { // failed to locate book or insert
          alert('Could not complete the move. Please try again later.');
          window.location.reload();
        }
      }
    });
  }
}

/**
 * Handles selecting a book when clicked.
 */
function handleBookSelection() {
  //select all book items
  document.querySelectorAll('.book-column li').forEach(item => {
    item.addEventListener('click', () => {
      //remove 'selected' from any other book
      const currentSelected = document.querySelector('.book-column li.selected');
      if (currentSelected && currentSelected !== item) {
        currentSelected.classList.remove('selected');
      }
      //toggle 'selected' on the clicked item
      item.classList.toggle('selected');
    });
  });
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
      if (response.status === 201) {
        // book added successfully
        const json = await response.json();
        if (json.success) {
          // validating json translation
          const popup = document.getElementById('popup');
          modal.style.display = 'none';
          popup.style.display = 'block';
          buildBookSelector(json.data, bookshelfTable); // building the book selector
        } else {
          // loading default list if cannot translate to json
          alert('Error! Please try again');
        }
      } else if (response.status === 404) {
        // cannot add book, no user logged in
        alert('Please log in to add books to your bookshelf');
      } else {
        // unable to access the database
        alert('Network error. Please try again later');
      }
    } catch (error) {
      // unable to access the database
      alert(error.message);
    }
    // await addBookToShelf();
    form.reset();
  });
}

/**
 * A helper function that builds the book selector
 * for when a user wants to add a book to their bookshelf
 * @param {object} books
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
 * A function that adds a selected book to the users
 * to-read bookshelf
 * @param {object} title - the book title
 * @param {object} authors - the book authors
 * @param {object} addButton - the add button
 * @param {object} bookshelfTable - the table to be added to
 */
function configureInnerAddButton(title, authors, addButton, bookshelfTable) {
  const modalWindow = document.getElementById('popup');
  try {
    const token = document.getElementsByName('csrf-token')[0].getAttribute('content');
    addButton.addEventListener('click', async function () { // attempting to add a book to a bookshelf
      let response = await fetch('addbooktoshelf', { // insert fetch
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': token,
        },
        body: JSON.stringify({
          title: title,
          authors: authors,
          table: bookshelfTable
        }),
      });
      if (response.status === 201) { // insert worked, adding book in real time if possible or refreshing page
        alert(`${title} was added to your bookshelf`);
        document.getElementById('book-list').innerHTML = '';
        modalWindow.style.display = 'none';
        const json = await response.json();
        if (json.success) { // if the book id is available, loading book in real time
          const book = json.data;
          book.title = title;
          book.authors = authors;
          loadList(document.getElementById(bookshelfTable), [book]);
        }
        else { // reloading the page if cannot add book in real time
          window.location.reload();
        }
      } else if (response.status === 403) { // user is no longer logged in
        alert('Please log in to add books to your bookshelf');
      } else if (response.status === 409) { // the book already exist in the bookshelf
        alert(`${title} is already on your bookshelf`);
      } else { // network error
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


  clearButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      currShelf = btn.getAttribute('data-shelf');
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
      await clearShelfModal(currShelf);
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
  const token = document.getElementsByName('csrf-token')[0].getAttribute('content');

  try {
    const response = await fetch('clear', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token,
      },
      body: JSON.stringify({ bookshelf: currShelf }),
    });

    if (response.status === 200) { //response is successful, assign the shelf
      let listId = '';
      if (currShelf === 'to-read') {
        listId = 'to-read-books';
      } else if (currShelf === 'reading') {
        listId = 'reading-books';
      } else {
        listId = 'finished-books';
      }

      //set all lis to be empty
      const listElement = document.getElementById(listId);
      if (listElement) {
        listElement.innerHTML = '';
      } else { //if attempt to set the lis fails
        alert('Attempt to clear shelf failed.');
      }
    }
  } catch (error) {
    console.error('Error clearing shelf:', error);
    alert('Network error. Please try again.');
  }
}
