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
document.addEventListener('DOMContentLoaded', () => {
  bookDropdown();
  dragBooks();
  handleBookSelection();
  setupAddBookModal();
  
  // Find and attach the delete button listener
  // We need to give your delete link an ID
  const deleteBtn = document.getElementById('delete-book-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      deleteBook();
    });
  }
});

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
  const bookItems = document.querySelectorAll('.book-column li');
  const bookColumns = document.querySelectorAll('.book-column');

  let draggedItem = null;

  bookItems.forEach(item => {
    item.addEventListener('dragstart', () => {
      draggedItem = item;
      setTimeout(() => item.classList.add('dragging'), 0);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      draggedItem = null;
    });
  });

  bookColumns.forEach(column => {
    column.addEventListener('dragover', e => {
      e.preventDefault();
      column.classList.add('over');
    });
    column.addEventListener('dragleave', () => {
      column.classList.remove('over');
    });
    column.addEventListener('drop', () => {
      column.classList.remove('over');
      const list = column.querySelector('ul');
      if (draggedItem && list) {
        list.appendChild(draggedItem);
      }
    });
  });
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
  const csrfToken = document.querySelector('input[name="_csrf"]').value;

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
async function deleteBook() {
  const selectedBook = document.querySelector('.book-column li.selected');
  if (!selectedBook) {
    alert('Please click on a book to select it first.');
    return;
  }

  const bookId = selectedBook.dataset.bookId;
  const column = selectedBook.closest('.book-column');
  
  const statusMap = {
    'already-read': 'read',
    'currently-reading': 'reading',
    'will-read': 'to-read'
  };
  const status = statusMap[column.id];
  const csrfToken = document.querySelector('input[name="_csrf"]').value;

  try {
    const response = await fetch('/bookshelf/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ bookId, status })
    });

    const result = await response.json();

    if (result.success) {
      selectedBook.remove();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('A network error occurred.');
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
    await addBookToShelf();
    
    modal.style.display = 'none';
    form.reset();
  });
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


