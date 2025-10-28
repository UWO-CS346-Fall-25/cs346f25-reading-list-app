// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  fillComboBoxes();
  fetchRecommendations();
});

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
        loadRecommendations(false, json.data);
      }
      else { // loading default list if cannot translate to json
        loadRecommendations(true);
      }
    }
    else { // loading default list if database could not be reached
      loadRecommendations(true);
    }
  }
  catch(error) { // loading default list if fetch request could not be completed
    loadRecommendations(true);
  }
}

/**
 * A helper function that builds the
 * recommended list of books for the
 * landing page
 * @param {object} error - true if default needed, false if not
 * @param {object} recommendations - list of recommendations, null if unable to located list
 */
function loadRecommendations(error, recommendations) {
  if (error) { // loading default list
    list = [{title: "Book", author: "Arthur Waldman"}];
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
    rightSpacer.append(button);
    rightSpacer.style.borderColor = color;
    book.append(rightSpacer);
    li.append(book);
    recommendedList.append(li);
  });
}
