

// const { supabase } = require('./db.js');
const supabase = require('../models/db');
/**
 * Adds a book to the user's specific status table.
 */
exports.addBook = async ({ title, author, status, userId }) => {
  
  const defaultGenre = 'Unknown';

  const statusToTableMap = {
    'to-read': 'books_to_read',
    'reading': 'books_being_read',
    'read': 'books_read'
  };

  const tableName = statusToTableMap[status];
  
  if (!tableName) {
    throw new Error('Invalid book status provided.');
  }

  //insert directly into the correct status table
  const { data, error: insertError } = await supabase
    .from(tableName)
    .insert([
      { 
        title: title, 
        author: author, 
        genre: defaultGenre, 
        user_id: userId 
      }
    ])
    .select();

  if (insertError) {
    console.error(`Error adding book to ${tableName}:`, insertError.message);
    throw new Error(insertError.message);
  }

  return data[0]; //return the new book object
};

/**
 * Fetches all books for a specific user from all three status tables.
 */
exports.getBooks = async (userId) => {
  try {
    const [toReadResult, readingResult, readResult] = await Promise.all([
      supabase
        .from('books_to_read')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('books_being_read')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('books_read')
        .select('*')
        .eq('user_id', userId)
    ]);

    if (toReadResult.error) throw toReadResult.error;
    if (readingResult.error) throw toReadResult.error;
    if (readResult.error) throw readResult.error;

    return {
      'to-read': toReadResult.data || [],
      'reading': readingResult.data || [],
      'read': readResult.data || []
    };

  } catch (error) {
    console.error('Error fetching user books:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Deletes a book from a user's specific status table.
 */
exports.deleteBook = async ({ bookId, status, userId }) => {
  const statusToTableMap = {
    'to-read': { table: 'books_to_read', idColumn: 'to_read_id' },
    'reading': { table: 'books_being_read', idColumn: 'being_read_id' },
    'read': { table: 'books_read', idColumn: 'read_id' }
  };

  const tableInfo = statusToTableMap[status];

  if (!tableInfo) {
    throw new Error('Invalid book status provided.');
  }

  const { data, error } = await supabase
    .from(tableInfo.table)
    .delete()
    .eq('user_id', userId)
    .eq(tableInfo.idColumn, bookId)
    .select();

  if (error) {
    console.error(`Error deleting book from ${tableInfo.table}:`, error.message);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error('Book not found or user not authorized to delete.');
  }

  return data[0];
};