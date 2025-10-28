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
   * Returns the entire books table from
   * the database
   * @returns {Promise<object>} the book list
   */
  static async getRecommended() {
    const { data, error } = await supabase.supabase.from('books').select('*');
    if (error === null) { // validating query
      return data;
    }
    else { // throwing an error if an error occurred
      throw new Error("Database connection error");
    }
  }

  /**
   * Adds a new user to the user table
   * @param {object} email - user email
   * @param {object} password - user password
   * @returns {Promise<object>} the user object
   */
  static async registerUser(email, password, dataUsage) {
    try { // attempting to add the user
      const {data, error} = await supabase.supabase.from('users').insert([{email: email, password: password, books_to_read: [], books_reading: [], books_read: [], sharing_data: dataUsage}]);
      if (error && error.code === '23505') { // email already exists
        throw new Error('Email already exists');
      }
      return data;
    }
    catch (error) { // rethrowing email already exists error
      throw new Error('Email already exists');
    }
  }

  static async validateLogin(email, password) {
    try {
      const { data, error } = await supabase.supabase.from('users').select('*').eq('email', email);
      // this returns an array containing the empty login details
      // console.log(data);
      return data;
    }
    catch(error) {
      console.log("database crash!");
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
