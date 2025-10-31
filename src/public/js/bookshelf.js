/**
 * All of the functions required for functionality of bookshelf including:
 * - Manage Book's dropdown
 * - Handling the Manage Books button features: add, delete, change, move
 * - Dragging each book
 *
 */


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
  const bookColumns = document.querySelectorAll('.book-column'); // <-- columns, not ul

  let draggedItem = null;

  //lets each book be dragged
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

  //Books can be dropped into the entire column, rather than just the list-item space
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

      // find this column's <ul>
      const list = column.querySelector('ul');
      if (draggedItem && list) {
        list.appendChild(draggedItem);
      }
    });
  });
}

//Lets the DOMContent be loaded before any of the functions are called
document.addEventListener('DOMContentLoaded', () => {
  bookDropdown();
  dragBooks();
});



//Create code for adding, deleting, updating/changing, and moving a book
//Takes a String param with the add, del, upd, mov

/***
 *
 * document.querySelector("#author").value =
 *
 *
 */
