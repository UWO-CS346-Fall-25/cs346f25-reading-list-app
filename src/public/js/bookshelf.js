/**
 * All of the functions required for functionality of bookshelf including:
 * - Manage Book's dropdown
 * - Handling the Manage Books button features: add, delete, change, move
 * - Dragging each book
 *
 */

//This breaks the page, gotta figure out another way to get the supabase client
// const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

//Lets the DOMContent be loaded before any of the functions are called
document.addEventListener('DOMContentLoaded', () => {
  bookDropdown();
  dragBooks();
  setupAddBookModal();
});

const manageBtn = document.getElementById('manage-books');

//Need to validate the book from the library api, then update the respective column with the new book list

/**
 * Handles the Manage Books button dropdown event
 */
function bookDropdown() {

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



const dropdownMenu = document.getElementById('books-dropdown-menu');
const links = dropdownMenu.querySelectorAll('a');

links.forEach(link => {
  link.addEventListener('click', () => {
    dropdownMenu.classList.remove('show');
    console.log(link.id + ' clicked');
  });
});

/**
 * 
 */
function addBook() {


  const addBookLink = document.getElementById('addBook');
  addBookLink.addEventListener('click', async (e) => {
    e.preventDefault();

    const title = prompt('Enter book title:');
    const author = prompt('Enter author name:');
    if (!title || !author) return;

    await addBookToShelf(title, author);
  });

}

async function addBookToShelf(title, author) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('User not logged in:', userError.message);
    return;
  }

  const userId = user.id;

  // Fetch existing bookshelf record
  const { data, error } = await supabase
    .from('bookshelves')
    .select('to_read')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching bookshelf:', error.message);
    return;
  }

  const currentList = data.to_read || [];

  // Add new book
  const updatedList = [...currentList, { title, author }];

  // Update table
  const { error: updateError } = await supabase
    .from('bookshelves')
    .update({ to_read: updatedList })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating bookshelf:', updateError.message);
  } else {
    alert(`Added "${title}" by ${author} to your To Read list!`);
  }
}


function setupAddBookModal() {
  const modal = document.getElementById('addBookModal');
  const addLink = document.querySelector('.dropdown-link:nth-child(1)');
  const closeBtn = modal.querySelector('.close');
  const form = document.getElementById('addBookForm');

  // Open modal when "Add" clicked
  addLink.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
  });

  // Close modal when X clicked
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close when clicking outside modal
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Handle form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();

    if (!title || !author) return;

    await addBookToShelf(title, author);
    modal.style.display = 'none';
    form.reset();
  });
}

