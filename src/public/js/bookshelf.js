/**
 *
 *
 */
function toggleDropdown() {
    document.getElementById("books-dropdown-menu").classList.toggle("show");
    alert("this is not working");
  }

  // Optional: close dropdown if user clicks outside
  window.onclick = function(event) {
    if (!event.target.matches('.managebooks')) {
      const dropdowns = document.getElementsByClassName("books-dropdown-content");
      for (let i = 0; i < dropdowns.length; i++) {
        dropdowns[i].classList.remove('show');
      }
    }
  }

//Create code for adding, deleting, updating/changing, and moving a book
//Takes a String with the add, del, upd, mov

/**
 * Create the book constructor
 * w/ author, pageCount, genre, and
 *
 *
 */

/***
 *
 * document.querySelector("#author").value =
 *
 *
 */
