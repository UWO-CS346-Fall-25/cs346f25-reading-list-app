# Final Feature




# Feature/week12/deliverable5_api

Updates to the bookshelf page:
  - Books can now be dragged right after being added on the bookshelf page
  - Fixed issues where multiple event handlers were being added to each book, causing double drag
  - Added loading spinner to ensure a book is properly moved before the user can move another book
  - Set bookId to display none, allowing for an anonymous database hook when moving books

Updates for external API (Open Library):
  - New model created to only fetch from API, separating the API model from the database model
  - Did not add routes or controllers for API calls, instead imported new model into existing
    controllers that need to call to the API

Updates to Manage Books:
   -Move now works and instead of dragging, you can use the move modal

## Feature/week11/deliverable4_auth

Updates to Landing page:
   -When signed in and navigating to the landing page, it will display in the center of the header: Welcome back User!

Updates to Bookshelf page:
   -The user's chosen name in the top left corner: User's Bookshelf.
   -All books the user has added to any of the three bookshelves.

Updates to Bookshelf column:
   -By clicking on the trash icon next to the column's name, users can Clear/Delete all books from a given column.

Updates to Books
   -Books can be dragged from column to column and the database will update with each drag. Don't move too fast as the DB and DOM take a bit to update.
   -By clicking on the trash icon attached to the right end of a book, users can manually delete books from each column.
   -Books now match the styling of the recommendation page's books.

Updates to Manage Books:
   -Add: Uses the Library API, similar to the recommended books page. Users can search based on title and author
   -Move: Still in progress, will be finished by next submission

## Feature/week10-Database-Integration

Small updates added to index.ejs to ensure filter works correctly.
Login processes now checks auth table in database to log in users.
The '+' button on index.ejs is now hooked up to an external API,
allowing users to select the edition of the book they want to add.

-Bookshelf now displays a user's books, and inside of Manage Books, add is partially functional.
-Working on modifiying the existing code for fetching the books for the page.
-Delete is also partially completed

How would we use row level security?
We would use row level security by ensuring that users cannot add books
to bookshelves that do not contain their user id. This would prevent users
from being able to modify each other's bookshelves.

## Feature/Week9-UI Enhancements

Bookshelf.ejs received some placeholder books for each column, and received updated css styling.
   - Added gradient colorways to each column
   - Added background photos for the header, footer, and main
   - Added new Font Styling
   - Sign out is no longer a button, but rather an anchor that takes users back to the Home Screen

Index page updates:
- functioning filter form
- books enter page with animation
- nav bar options change if sessions is active

## Feature/Week8-Interactivity

Added 4 jscript files: bookshelf, index, login, and register
   Index handles the book recommendation logic for the home screen
   Login and register handle email and password logic
      - Added error handlers in app.js for the email and password routing
      - loginController, registerController, and userController are modified for request and response handling with our database

booklist.ejs and its counterparts are now bookshelf.ejs etc. Users can now move books between columns by dragging, and will be granted the option to add, delete, update, or move books, as well as sign out.
   - Bookshelf.js handles the dropdown button and drag and drop logic

## Feature/Week7-Layout Update

index.ejs has been updated to act as the landing page. This page will display recommendations for
users who are not logged in, as well as display the most recent updates to the website.

login.ejs has been added to provide a screen for users to log in to the website, or reset their password.

register.ejs has been added to provide a screen for users to register with our website.

booklist.ejs has been added to provide logged in users with a screen to see the following lists:

- books they plan to read
- books they are reading
- books they have finished reading

## CS346 Semester Project Template

A teaching template for building secure web applications with Node.js, Express, EJS, and PostgreSQL.

## Features

- 🚀 **Node.js 20** + **Express 4** - Modern JavaScript backend
- 🎨 **EJS** - Server-side templating
- 🗄️ **PostgreSQL** - Reliable relational database
- 🔒 **Security First** - Helmet, CSRF protection, secure sessions
- 📝 **Clean Code** - ESLint, Prettier, best practices
- 🎓 **Educational** - Well-documented, instructional code

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd cs346-semester-project-template
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up PostgreSQL database**

   ```bash
   # Create database (adjust credentials as needed)
   createdb your_database_name
   ```

5. **Run migrations**

   ```bash
   npm run migrate
   ```

6. **Seed database (optional)**

   ```bash
   npm run seed
   ```

7. **Start the application**

   ```bash
   npm run dev
   ```

8. **Open your browser**

   ```
   http://localhost:3000
   ```

## Project Structure

```
├── src/
│   ├── server.js           # Server entry point
│   ├── app.js              # Express app configuration
│   ├── routes/             # Route definitions
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── views/              # EJS templates
│   └── public/             # Static files (CSS, JS, images)
├── db/
│   ├── migrations/         # Database migrations
│   ├── seeds/              # Database seeds
│   ├── migrate.js          # Migration runner
│   ├── seed.js             # Seed runner
│   └── reset.js            # Database reset script
├── docs/                   # Documentation
│   ├── README.md           # Documentation overview
│   ├── SETUP.md            # Setup guide
│   └── ARCHITECTURE.md     # Architecture details
├── .env.example            # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── .prettierrc.json        # Prettier configuration
└── package.json            # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run reset` - Reset database (WARNING: deletes all data!)
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format code with Prettier

## Security Features

- **Helmet**: Sets security-related HTTP headers
- **express-session**: Secure session management with httpOnly cookies
- **csurf**: Cross-Site Request Forgery (CSRF) protection
- **Parameterized SQL**: SQL injection prevention with prepared statements
- **Environment Variables**: Sensitive data kept out of source code

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- [docs/README.md](docs/README.md) - Documentation overview
- [docs/SETUP.md](docs/SETUP.md) - Detailed setup instructions
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architecture and design patterns

## Technology Stack

- **Runtime**: Node.js 20
- **Framework**: Express 4
- **Templating**: EJS
- **Database**: PostgreSQL (with pg driver)
- **Security**: Helmet, express-session, csurf
- **Development**: ESLint, Prettier, Nodemon

## Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [EJS Documentation](https://ejs.co/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [OWASP Security Guide](https://owasp.org/)

## Contributing

This is a teaching template. Feel free to:

- Report issues
- Suggest improvements
- Submit pull requests
- Use it for your own projects

## License

ISC
