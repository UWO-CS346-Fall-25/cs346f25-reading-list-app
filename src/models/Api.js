class Api {
  /**
   * A function that gets all books that match
   * the book a user wants to add
   * @param {object} title book title
   * @param {object} author book author
   * @returns {Promise<object>} user entry if valid, else empty
   */
  static async getBookList(title, author) {
    try {
      // attempting to get book list from Open Library API
      const query = new URLSearchParams({ title, author });
      return await fetch(`https://openlibrary.org/search.json?${query}`);
    } catch (networkError) {
      // throwing an error if an error occurred
      throw new Error();
    }
  }
}

module.exports = Api;
