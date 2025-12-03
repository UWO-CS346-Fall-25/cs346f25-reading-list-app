class Api {
  /**
   * A function that gets all books that match
   * the book a user wants to add
   * @param {object} title book title
   * @param {object} author book author
   * @returns {Promise<object>} user entry if valid, else empty
   */
  static async getBookList(title, author) {
    try { // attempting to get book list from Open Library API
      const query = new URLSearchParams({ title, author });
      const response = await fetch(`https://openlibrary.org/search.json?${query}`);
      return await this.getEditionList(await response.json());
    }
    catch (networkError) { // throwing an error if an error occurred
      throw new Error(networkError.message);
    }
  }

  /**
   * A function that creates a booklist using every
   * valid edition of a book. A valid edition has an
   * isbn number, a number of pages, and a cover
   * @param {object} bookList
   * @returns a list of all valid editions of a given book
   */
  static async getEditionList(bookList) {
    let editionList = [];
    for (const book of bookList.docs) { // checking the editions of each iteration of the book
      const authors = book.author_name; // storing the author list for easy access
      const editions = await (await fetch(`https://openlibrary.org${book.key}/editions.json`)).json(); // fetching all editions
      for (let edition of editions.entries) { // checking each edition
        if (edition.isbn_13 && edition.number_of_pages) { // validating isbn number and number of pages
          if (edition.cover_i || edition.cover_edition_key || edition.ocaid) { // validating a book cover
            edition.authors = authors;
            editionList.push(edition);
          }
          else if (edition.covers) { // locating alternative book covers
            let index = 0;
            let foundCover = false;
            while (!foundCover && index < edition.covers.length) { // checking alternative book covers and grabbing the first valid cover
              if (edition.covers[index] > 0) {
                foundCover = true;
                edition.authors = authors;
                edition.cover = edition.covers[index];
                editionList.push(edition);
              }
              index++;
            }
          }
        }
      }
    }
    return editionList;
  }
}

module.exports = Api;
