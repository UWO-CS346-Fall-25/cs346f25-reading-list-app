/**
 * User Model
 *
 * This model handles all database operations related to users.
 */
// Supabase connection
const supabase = require('../models/db');
var numBooksToDisplay = 100;

/**
 * The class that communicates directly with the database
 */
class User {
  /**
   * A function that takes a bookshelf id
   * and get the name of the database table
   * associated with it
   * @param {object} shelfId
   * @returns string containing the table name
   */
  static getTableName(shelfId) {
    let databaseTable = null;
    if (shelfId === 'to-read-books') {
      databaseTable = 'books_to_read';
    } else if (shelfId === 'reading-books') {
      databaseTable = 'books_being_read';
    } else {
      databaseTable = 'books_read';
    }
    return databaseTable;
  }

  /**
   * Returns a list of all authors
   * from the books table
   * @returns {Promise<object>} the author list
   */
  static async getAuthors() {
    const { data, error } = await supabase.supabase.from('books_being_read')
                                                   .select('authors')
                                                   .order('added', { ascending: false })
                                                   .limit(numBooksToDisplay);
    if (error === null) {
      // validating query
      return data;
    } else {
      // throwing an error if an error occurred
      throw new Error('Database connection error');
    }
  }

  // THE FUNCTIONS BELOW ARE FOR FUTURE EXPANSION, DO NOT DELETE
  // /**
  //  * Returns a list of all genres
  //  * from the books table
  //  * @returns {Promise<object>} the genre list
  //  */
  // static async getGenres() {
  //   const { data, error } = await supabase.supabase
  //     .from('books')
  //     .select('genre');
  //   if (error === null) {
  //     // validating query
  //     return data;
  //   } else {
  //     // throwing an error if an error occurred
  //     throw new Error('Database connection error');
  //   }
  // }

  // /**
  //  * Returns the largest page count in the books table
  //  * @returns {Promise<object>} the largest page count
  //  */
  // static async getPages() {
  //   const { data, error } = await supabase.supabase
  //     .from('books')
  //     .select('page_count')
  //     .order('page_count', { ascending: false })
  //     .limit(1);
  //   if (error === null) {
  //     // validating query
  //     return data;
  //   } else {
  //     // throwing an error if an error occurred
  //     throw new Error('Database connection error');
  //   }
  // }

  /**
   * Returns the filtered books table from
   * the database
   * @returns {Promise<object>} the book list
   */
  static async getFiltered(author, genre, pageCount) {
    let query = supabase.supabase.from('books_being_read').select('*'); // setting up the query
    if (author.trim() !== '') {
      // adding author condition if not null
      query = query.contains('authors', [author]);
    }
    // CODE BELOW FOR FUTURE EXPANSION, DO NOT DELETE
    // if (genre.trim() !== '') {
    //   // adding genre condition if not null
    //   query = query.eq('genre', genre);
    // }
    // if (pageCount !== '-1') {
    //   // adding page count condition if not null
    //   query = query.lte('page_count', pageCount);
    // }
    const { data, error } = await query; // completing query
    if (error === null) {
      // validating query
      return data;
    } else {
      // throwing an error if an error occurred
      throw new Error('Database connection error');
    }
  }

  /**
   * Returns the entire books table from
   * the database
   * @returns {Promise<object>} the book list
   */
  static async getTrending() {
    const { data, error } = await supabase.supabase.from('books_being_read')
                                                   .select('*')
                                                   .order('added', { ascending: false })
                                                   .limit(numBooksToDisplay);
    if (!error) {
      // validating query
      return data;
    } else {
      // throwing an error if an error occurred
      throw new Error('Database connection error');
    }
  }

  /**
   * Adds a new user to the user table
   * @param {object} email - user email
   * @param {object} password - user password
   * @returns {Promise<object>} the user object
   */
  static async registerUser(username, email, password) {
    try {
      // attempting to register a user
      const { data, error } = await supabase.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: username,
          },
        },
      });
      if (error) {
        // throwing an error if cannot connect to database
        throw new Error(error.message);
      }
      return data;
    } catch (networkError) {
      // catching potential network error
      throw new Error(networkError.message);
    }
  }

  /**
   * A function that validates the users login credentials
   * @param {object} email user email address
   * @param {object} password user password
   * @returns {Promise<object>} user entry if valid, else empty
   */
  static async validateLogin(email, password) {
    try {
      // attempting to verify the user
      const { data, error } = await supabase.supabase.auth.signInWithPassword({
        email,
        password,
      });
      return data;
    } catch (networkError) {
      // throwing an error if an error occurred
      throw new Error(networkError.message);
    }
  }

  /**
   * A function that sends the user a password reset email
   * @param {object} email user email address
   * @returns {Promise<object>} True if email sent, false if now
   */
  static async passwordReset(email) {
    try {
      // attempting to send the password reset email
      const { data, error } =
        await supabase.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'http://localhost:3000/password',
        });
      if (error) {
        // password reset email was not sent
        return false;
      } else {
        // password reset email was sent
        return true;
      }
    } catch (networkError) {
      // unable to connect to database
      throw new Error(networkError.message);
    }
  }

  /**
   * A function that updates a user's password
   * @param {object} password user's new password
   * @param {object} accessToken user's access token
   * @param {object} refreshToken user's refresh token
   * @returns {Promise<object>} True if password updated, false if now
   */
  static async resetPassword(password, accessToken, refreshToken) {
    try {
      // attempting to send the password reset email
      await supabase.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      const { data, error } = await supabase.supabase.auth.updateUser({
        password: password,
      });
      if (error) {
        // password was not reset
        return false;
      } else {
        // password was reset
        return true;
      }
    } catch (networkError) {
      // unable to connect to database
      throw new Error(networkError.message);
    }
  }

  /**
   * Add
   */
  static async addBook(title, authors, bookshelfTable, userId) {
    try {
      let databaseTable = this.getTableName(bookshelfTable);
      const { data, error } = await supabase.supabase
        .from(databaseTable)
        .select('*')
        .eq('title', title)
        .contains('authors', authors)
        .eq('user_id', userId);
      if (data.length === 0) {
        // continue with the add process
        const { data, error } = await supabase.supabase
          .from(databaseTable)
          .insert([{ title: title, authors: authors, user_id: userId }], {
            returning: 'representation',
          });
        if (error) {
          // addition did not work - network issue
          throw new Error();
        } else {
          // addition worked
          let idType = null;
          if (databaseTable === 'books_to_read') {
            // determining which column contains the bookId
            idType = 'to_read_id';
          } else if (databaseTable === 'books_being_read') {
            idType = 'being_read_id';
          } else {
            idType = 'read_id';
          }
          const { data, error } = await supabase.supabase
            .from(databaseTable) // getting the id of the book inserted
            .select(idType)
            .eq('title', title)
            .contains('authors', authors)
            .eq('user_id', userId);
          return data[0];
        }
      } else {
        // returning false - the addition failed because book already exists
        return false;
      }
    } catch (networkError) {
      // throwing an error if a network error occurred
      throw new Error();
    }
  }

  /**
   * A function that retrieves a user's to-read list
   * @param {object} userId
   * @returns {Promise<object>} the list of books
   */
  static async getToRead(userId) {
    const { data, error } = await supabase.supabase
      .from('books_to_read')
      .select('to_read_id, title, authors')
      .eq('user_id', userId);
    if (error === null) {
      // validating query
      return data;
    } else {
      // throwing an error if an error occurred
      throw new Error();
    }
  }

  /**
   * A function that retrieves a user's reading list
   * @param {object} userId
   * @returns {Promise<object>} the list of books
   */
  static async getReading(userId) {
    const { data, error } = await supabase.supabase
      .from('books_being_read')
      .select('being_read_id, title, authors')
      .eq('user_id', userId);
    if (error === null) {
      // validating query
      return data;
    } else {
      // throwing an error if an error occurred
      throw new Error();
    }
  }

  /**
   * A function that retrieves a user's read list
   * @param {object} userId
   * @returns {Promise<object>} the list of books
   */
  static async getRead(userId) {
    const { data, error } = await supabase.supabase
      .from('books_read')
      .select('read_id, title, authors')
      .eq('user_id', userId);
    if (error === null) {
      // validating query
      return data;
    } else {
      // throwing an error if an error occurred
      throw new Error();
    }
  }

  /**
   * A function that moves a book from one table to another
   * @param {object} bookId - the primary key to locate the book
   * @param {object} originShelf - the origin shelf
   * @param {object} destinationShelf - the shelf being moved to
   * @param {object} userId - the user's id
   * @returns {Promise<object>} new book id, false if could not move, null if partially worked
   */
  static async moveBook(bookId, originShelf, destinationShelf, userId) {
    let originTable = this.getTableName(originShelf);
    let destinationTable = this.getTableName(destinationShelf);
    let idType = null;
    if (originTable === 'books_to_read') {
      // determining which column contains the bookId
      idType = 'to_read_id';
    } else if (originTable === 'books_being_read') {
      idType = 'being_read_id';
    } else {
      idType = 'read_id';
    }
    try {
      // attempting database operations
      const { data, error } = await supabase.supabase
        .from(originTable) // grabbing the book details
        .select('title, authors')
        .eq(idType, bookId)
        .eq('user_id', userId);
      const book = data; // restoring data for scope
      if (book.length === 1) {
        // confirming the book was located
        const { data, error } = await supabase.supabase
          .from(destinationTable) // attempting to insert the book into the destination table
          .insert([
            { title: book[0].title, authors: book[0].authors, user_id: userId },
          ])
          .select();
        const newId = data.length === 1 ? Object.values(data[0])[0] : null;
        if (!error) {
          // only attempting deletion if the insert worked
          const { data, error } = await supabase.supabase
            .from(originTable) // attempting to delete from the origin table
            .delete()
            .eq(idType, bookId);
          if (!error) {
            // all operations worked
            return newId;
          } else {
            // insert worked, but deletion failed
            return null;
          }
        } else {
          // insert failed
          return false;
        }
      } else {
        // not able to verify the book details
        return false;
      }
    } catch (error) { // initial select failed, network error
      throw new Error(error.message);
    }
  }

  /**
   * A function that removes a book from the
   * requested user's bookshelf
   * @param {object} bookId
   * @param {object} bookshelf
   * @returns {Promise<object>} true if success, false if not
   */
  static async removeBook(bookId, bookshelf) {
    try {
      const table = this.getTableName(bookshelf);
      let idType = null;
      if (table === 'books_to_read') {
        // determining which column contains the bookId
        idType = 'to_read_id';
      } else if (table === 'books_being_read') {
        idType = 'being_read_id';
      } else {
        idType = 'read_id';
      }
      const { data, error } = await supabase.supabase
        .from(table)
        .delete()
        .eq(idType, bookId);
      return true;
    } catch (error) {
      // network error
      throw new Error(error.message);
    }
  }

  /**
   * Clear shelf looks for all books in the table that matches the user's id and deletes them
   * @param {*} bookshelf user's bookshelf being cleared
   * @param {*} userId their id
   * @returns
   */
  static async clearShelf(bookshelf, userId) {
    try {
      const table = this.getTableName(bookshelf);

      const { error } = await supabase.supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing shelf:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Network error encountered in clearShelf:', error);
      return false;
    }
  }

  /**
   * Moves a book from one shelf to another using its title instead of ID.
   * @param {string} title - the book title
   * @param {string} originShelf - origin shelf )
   * @param {string} destinationShelf - destination shelf
   * @param {string} userId - user's id
   * @returns {Promise<object>} new book id, false if could not move, null if partially worked, 'NOT_FOUND' if no match
   */
  static async moveBookByTitle(title, originShelf, destinationShelf, userId) {
    const originTable = this.getTableName(originShelf);
    const destinationTable = this.getTableName(destinationShelf);

    let idType = null;
    if (originTable === 'books_to_read') {
      idType = 'to_read_id';
    } else if (originTable === 'books_being_read') {
      idType = 'being_read_id';
    } else {
      idType = 'read_id';
    }

    try {
      //find a matching book in the origin shelf
      const { data, error } = await supabase.supabase
        .from(originTable)
        .select(`${idType}, title, authors`)
        .eq('title', title)
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        return false; // DB error
      }

      if (!data || data.length === 0) {
        return 'NOT_FOUND'; // no book with that title on this shelf
      }

      const book = data[0];

      //insert into destination shelf
      const insertResult = await supabase.supabase
        .from(destinationTable)
        .insert([{ title: book.title, authors: book.authors, user_id: userId }])
        .select();

      if (insertResult.error) {
        return false; // insert failed
      }

      const insertedRows = insertResult.data || [];
      const newId =
        insertedRows.length === 1 ? Object.values(insertedRows[0])[0] : null;

      //delete from origin shelf
      const deleteResult = await supabase.supabase
        .from(originTable)
        .delete()
        .eq(idType, book[idType]);

      if (deleteResult.error) {
        return null; // insert worked, delete failed
      }

      return newId; // everything worked
    } catch (error) {
      return false; // network / unexpected
    }
  }
}

module.exports = User;
