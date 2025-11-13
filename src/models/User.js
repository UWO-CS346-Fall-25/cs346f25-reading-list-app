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
            display_name: username
          }
        }
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
      const { data, error } = await supabase.supabase.auth.signInWithPassword({ email, password });
      return data;
    } catch (networkError) {
      // throwing an error if an error occurred
      throw new Error();
    }
  }

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

  /**
   * Add
   */
  static async addBook(title, authors, bookshelfTable, userId) {
    try {
      let databaseTable = null;
      if (bookshelfTable === 'to-read') {
        databaseTable = 'books_to_read';
      } else if (bookshelfTable === 'reading') {
        databaseTable = 'books_being_read';
      } else {
        databaseTable = 'books_read';
      }
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
          .insert([{ title: title, authors: authors, user_id: userId }]);
        if (error) {
          // addition did not work - network issue
          throw new Error();
        } else {
          // addition worked
          return true;
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
    const { data, error } = await supabase.supabase.from('books_to_read').select('title, authors').eq('user_id', userId);
    if (error === null) { // validating query
      return data;
    }
    else { // throwing an error if an error occurred
      throw new Error();
    }
  }

  /**
   * A function that retrieves a user's reading list
   * @param {object} userId
   * @returns {Promise<object>} the list of books
   */
  static async getReading(userId) {
    const { data, error } = await supabase.supabase.from('books_being_read').select('title, authors').eq('user_id', userId);
    if (error === null) { // validating query
      return data;
    }
    else { // throwing an error if an error occurred
      throw new Error();
    }
  }

  /**
   * A function that retrieves a user's read list
   * @param {object} userId
   * @returns {Promise<object>} the list of books
   */
  static async getRead(userId) {
    const { data, error } = await supabase.supabase.from('books_read').select('title, authors').eq('user_id', userId);
    if (error === null) { // validating query
      return data;
    }
    else { // throwing an error if an error occurred
      throw new Error();
    }
  }

  /**
   * Moves a book from one shelf to another
   * @param {string} title - title of the book
   * @param {string} fromStatus - status/shelf moving FROM ('to-read', 'reading', 'read')
   * @param {string} toStatus - status/shelf moving TO ('to-read', 'reading', 'read')
   * @param {string} userId - user's ID
   * @returns {Promise<boolean>} - True if successful, False if failed
   */
  static async moveBook(title, fromStatus, toStatus, userId) {
    try {
      //Get the table names
      const getTableName = (status) => {
        if (status === 'to-read') return 'books_to_read';
        if (status === 'reading') return 'books_being_read';
        if (status === 'read') return 'books_read';
        return null;
      };

      const fromTable = getTableName(fromStatus);
      const toTable = getTableName(toStatus);

      //create the from and to tables
      const { data: bookData, error: fetchError } = await supabase.supabase
        .from(fromTable)
        .select('id, title, authors') 
        .ilike('title', title.trim())
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError || !bookData) {
        console.log('DEBUG: Book NOT found in source table.');
        return false;
      }

      const realTitle = bookData.title;
      const authors = bookData.authors; 
      const sourceId = bookData.id; // <--- CAPTURE THE ID

      // STEP 2: INSERT (Copy to new table)
      const { error: insertError } = await supabase.supabase
        .from(toTable)
        .insert([{ title: realTitle, authors: authors, user_id: userId }]);

      if (insertError) {
        console.log('DEBUG: Insert failed (duplicate?).', insertError);
        return false;
      }

      // STEP 3: DELETE (Remove from old table using ID)
      // This is much safer than matching title/authors
      const { error: deleteError } = await supabase.supabase
        .from(fromTable)
        .delete()
        .eq('id', sourceId); // <--- USE ID HERE

      if (deleteError) {
        console.log('DEBUG: Delete failed:', deleteError);
        return false;
      }

      return true;

    } catch (error) {
      console.error('DEBUG: Exception:', error);
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
