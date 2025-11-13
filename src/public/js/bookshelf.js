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
document.addEventListener('DOMContentLoaded', async function() {
  await loadBooks();
  bookDropdown();
  dragBooks();
  handleBookSelection();
  setupAddBookModal();
  calibrateModal();

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
    catch(error) {
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
      otherAuthors.textContent = `+ ${numAuthors} other authors`;
      center.append(otherAuthors);
    }
    book.append(center);
    const rightSpacer = document.createElement('div');
    rightSpacer.classList.add('right-spacer');
    // const button = document.createElement('button');
    // button.textContent = '+';
    // button.title = 'Add to bookshelf';
    // button.classList.add('add-button');
    // rightSpacer.append(button);
    rightSpacer.style.borderColor = color;
    book.append(rightSpacer);
    li.append(book);
    li.draggable = true;
    bookShelf.append(li);
  });
}

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
 * Handles the draggable books inside each book column
 */
function dragBooks() {
  const bookshelves = document.getElementsByClassName('bookshelf');
  let draggedItem = null;
  for (const shelf of bookshelves) {
    for (const book of shelf.childNodes) {
      try {
        book.addEventListener('dragstart', function () {
          draggedItem = book;
        });
      }
      catch(error) {
        console.log(error.message);
      }
    }
    shelf.addEventListener('dragover', function (e) {
      e.preventDefault();
    });
    shelf.addEventListener('drop', function (e) {
      e.preventDefault();
      shelf.append(draggedItem);
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
 * Adds a book to the table of the users choosing
 */
async function addBookToShelf() {
  const csrfToken = document
    .getElementsByName('csrf-token')[0]
    .getAttribute('content');

  try { // attempting to add the requested book
    const author = document.getElementById('book-author').value;
    const title = document.getElementById('book-title').value;
    const bookshelfTable = document.getElementById('book-status').value;

    const response = await fetch('/addbook', { // fetch to attempt to add book
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ title, author, bookshelfTable })
    });
    if (response.status === 201) { // add the book to the DOM structure
      // TO DO FOR DANE
    }
    else if (response.status === 409){ // duplicate book detected
      alert("The requested book already exists in the table");
    }
    else { // alerting user of network error
      alert("Network error! Please try again later");
    }
  }
  catch (error) { // alerting user of network error
    alert('A network error occurred.');
  }
}

/**
 * Handles deleting a book
 */
// async function deleteBook() {
//   const selectedBook = document.querySelector('.book-column li.selected');
//   if (!selectedBook) {
//     alert('Please click on a book to select it first.');
//     return;
//   }

//   const bookId = selectedBook.dataset.bookId;
//   const column = selectedBook.closest('.book-column');

//   const statusMap = {
//     'already-read': 'read',
//     'currently-reading': 'reading',
//     'will-read': 'to-read'
//   };
//   const status = statusMap[column.id];
//   const csrfToken = document
//     .getElementsByName('csrf-token')[0]
//     .getAttribute('content');

//   try {
//     const response = await fetch('/bookshelf/delete', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'CSRF-Token': csrfToken
//       },
//       body: JSON.stringify({ bookId, status })
//     });

//     const result = await response.json();

//     if (result.success) {
//       selectedBook.remove();
//     } else {
//       alert('Error: ' + result.message);
//     }
//   } catch (error) {
//     console.error('Network error:', error);
//     alert('A network error occurred.');
//   }
// }

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
 * @param {object} title
 * @param {object} authors
 * @param {object} addButton
 */
function configureInnerAddButton(title, authors, addButton, bookshelfTable) {
  const modalWindow = document.getElementById('popup');
  try {
    const token = document
      .getElementsByName('csrf-token')[0]
      .getAttribute('content');
    addButton.addEventListener('click', async function () {
      let response = await fetch('addbooktoshelf', {
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
      if (response.status === 201) {
        alert(`${title} was added to your bookshelf`);
        document.getElementById('book-list').innerHTML = '';
        modalWindow.style.display = 'none';
      } else if (response.status === 403) {
        alert('Please log in to add books to your bookshelf');
      } else if (response.status === 409) {
        alert(`${title} is already on your bookshelf`);
      } else {
        alert('Network error! Please try again');
      }
    });
  } catch (error) {
    alert('Network error! Please try again');s
  }
}

/**
 * Helper function to add a new book to the DOM.
 */
function addBookToDOM(title, author, bookshelfTable) {
  const statusToColumnId = {
    'to-read': 'will-read',
    'reading': 'currently-reading',
    'read': 'already-read'
  };
  const columnId = statusToColumnId[status];
  const list = document.querySelector(`#${columnId} ul`);
  if (!list) return;

  const newBookItem = document.createElement('li');
  newBookItem.setAttribute('draggable', 'true');
  newBookItem.setAttribute('data-book-id', book.uuid || book.to_read_id || book.being_read_id || book.read_id);

  //must match the EJS structure
  newBookItem.innerHTML = `<p>${book.title}</p><p>${book.author}</p>`;

  //add listeners to the new book
  newBookItem.addEventListener('click', () => {
    const currentSelected = document.querySelector('.book-column li.selected');
    if (currentSelected) {
      currentSelected.classList.remove('selected');
    }
    newBookItem.classList.add('selected');
  });

  newBookItem.addEventListener('dragstart', () => {
    draggedItem = newBookItem;
    setTimeout(() => newBookItem.classList.add('dragging'), 0);
  });
  newBookItem.addEventListener('dragend', () => {
    newBookItem.classList.remove('dragging');
    draggedItem = null;
  });

  list.appendChild(newBookItem);
}


