// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function () {
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
});

/**
 * A helper function that builds the
 * recommended list of books for the
 * landing page
 * @param {object} loadDefault - true if default needed, false if not
 * @param {object} list - list of books, null if unable to located list
 */
function loadList(loadDefault, list) {
  if (loadDefault) { // loading default list
    list = [{title: "Book", author: "Arthur Waldman"}];
  }
  const recommendedList = document.getElementById("books");
  list.forEach(element => { // building a visual book object
    const color = '#' + Math.floor(Math.random()*16777215).toString(16);
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
