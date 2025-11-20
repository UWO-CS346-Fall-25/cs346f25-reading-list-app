/**
 * User Model
 *
 * This model handles all database operations related to users.
 * Use parameterized queries ($1, $2, etc.) to prevent SQL injection.
 */
// Supabase connection
const supabase = require('../models/db');

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
    const { data, error } = await supabase.supabase
      .from('books')
      .select('author');
    if (error === null) {
      // validating query
      return data;
    } else {
      // throwing an error if an error occurred
      throw new Error('Database connection error');
    }
  }

  /**
   * Returns a list of all genres
   * from the books table
   * @returns {Promise<object>} the genre list
   */
  static async getGenres() {
    const { data, error } = await supabase.supabase
      .from('books')
      .select('genre');
    if (error === null) {
      // validating query
      return data;
    } else {
      // throwing an error if an error occurred
      throw new Error('Database connection error');
    }
  }

  /**
   * Returns the largest page count in the books table
   * @returns {Promise<object>} the largest page count
   */
  static async getPages() {
    const { data, error } = await supabase.supabase
      .from('books')
      .select('page_count')
      .order('page_count', { ascending: false })
      .limit(1);
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
  static async getRecommended() {
    const { data, error } = await supabase.supabase.from('books').select('*');
    if (error === null) {
      // validating query
      return data;
    } else {
      // throwing an error if an error occurred
      throw new Error('Database connection error');
    }
  }

  /**
   * Returns the filtered books table from
   * the database
   * @returns {Promise<object>} the book list
   */
  static async getFiltered(author, genre, pageCount) {
    let query = supabase.supabase.from('books').select('*'); // setting up the query
    if (author.trim() !== '') {
      // adding author condition if not null
      query = query.eq('author', author);
    }
    if (genre.trim() !== '') {
      // adding genre condition if not null
      query = query.eq('genre', genre);
    }
    if (pageCount !== '-1') {
      // adding page count condition if not null
      query = query.lte('page_count', pageCount);
    }
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
        throw new Error();
      }
      return data;
    } catch (networkError) {
      // catching potential network error
      throw new Error();
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
      throw new Error();
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
          ]).select();
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
    } catch (error) {
      // initial select failed, network error
      return false;
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
      throw new Error();
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
  //   /**
  //    * Find all users
  //    * @returns {Promise<Array>} Array of users
  //    */
  //   static async findAll() {
  //     const query =
  //       'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC';
  //     const result = await db.query(query);
  //     return result.rows;
  //   }

  //   /**
  //    * Find user by ID
  //    * @param {number} id - User ID
  //    * @returns {Promise<object|null>} User object or null
  //    */
  //   static async findById(id) {
  //     const query =
  //       'SELECT id, username, email, created_at FROM users WHERE id = $1';
  //     const result = await db.query(query, [id]);
  //     return result.rows[0] || null;
  //   }

  //   /**
  //    * Find user by email (including password for authentication)
  //    * @param {string} email - User email
  //    * @returns {Promise<object|null>} User object or null
  //    */
  //   static async findByEmail(email) {
  //     const query = 'SELECT * FROM users WHERE email = $1';
  //     const result = await db.query(query, [email]);
  //     return result.rows[0] || null;
  //   }

  //   /**
  //    * Create a new user
  //    * @param {object} userData - User data { username, email, password }
  //    * @returns {Promise<object>} Created user object
  //    */
  //   static async create(userData) {
  //     const { username, email, password } = userData;
  //     const query = `
  //       INSERT INTO users (username, email, password)
  //       VALUES ($1, $2, $3)
  //       RETURNING id, username, email, created_at
  //     `;
  //     const result = await db.query(query, [username, email, password]);
  //     return result.rows[0];
  //   }

  //   /**
  //    * Update user
  //    * @param {number} id - User ID
  //    * @param {object} userData - User data to update
  //    * @returns {Promise<object>} Updated user object
  //    */
  //   static async update(id, userData) {
  //     const { username, email } = userData;
  //     const query = `
  //       UPDATE users
  //       SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP
  //       WHERE id = $3
  //       RETURNING id, username, email, created_at, updated_at
  //     `;
  //     const result = await db.query(query, [username, email, id]);
  //     return result.rows[0];
  //   }

  //   /**
  //    * Delete user
  //    * @param {number} id - User ID
  //    * @returns {Promise<boolean>} True if deleted, false otherwise
  //    */
  //   static async delete(id) {
  //     const query = 'DELETE FROM users WHERE id = $1';
  //     const result = await db.query(query, [id]);
  //     return result.rowCount > 0;
  //   }
}

module.exports = User;
