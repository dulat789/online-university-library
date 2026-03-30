/**
 * Seed script — run with: npm run db:seed
 * Creates sample students and books for development/testing.
 *
 * Test credentials:
 *   alice@university.edu / password123
 *   bob@university.edu   / password123
 */
import "dotenv/config";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.DATABASE_URL
    ? {}
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME || "library",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
      }),
});

async function seed() {
  console.log("⏳ Running seed...");

  // Create tables if they don't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      surname VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      student_id VARCHAR(50) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      author VARCHAR(255) NOT NULL,
      description TEXT,
      year INTEGER CHECK (year > 0),
      total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies > 0),
      available_copies INTEGER NOT NULL DEFAULT 1
        CONSTRAINT chk_available_copies
          CHECK (available_copies >= 0 AND available_copies <= total_copies),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS borrowings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      borrow_date DATE NOT NULL,
      due_date DATE NOT NULL
        CONSTRAINT chk_due_after_borrow CHECK (due_date > borrow_date),
      return_date DATE
        CONSTRAINT chk_return_after_borrow CHECK (return_date IS NULL OR return_date >= borrow_date),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_borrowings_active
      ON borrowings(user_id, book_id)
      WHERE return_date IS NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id   SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id               SERIAL PRIMARY KEY,
      user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      room_id          INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      reservation_date DATE    NOT NULL,
      start_time       TIME    NOT NULL,
      end_time         TIME    NOT NULL,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    INSERT INTO rooms (name)
    VALUES
      ('Study Room 1'),
      ('Study Room 2'),
      ('Study Room 3'),
      ('Study Room 4'),
      ('Study Room 5')
    ON CONFLICT DO NOTHING
  `);

  const hashedPassword = await bcrypt.hash("password123", 10);

  await pool.query(
    `INSERT INTO users (name, surname, email, password, student_id)
     VALUES
       ('Alice', 'Smith',   'alice@university.edu', $1, 'STU001'),
       ('Bob',   'Johnson', 'bob@university.edu',   $1, 'STU002')
     ON CONFLICT (email) DO NOTHING`,
    [hashedPassword],
  );

  await pool.query(`
    INSERT INTO books (title, author, description, year, total_copies, available_copies)
    VALUES
      ('The Great Gatsby',        'F. Scott Fitzgerald', 'A story of wealth, obsession and the American Dream set in the Jazz Age.', 1925, 3, 3),
      ('To Kill a Mockingbird',   'Harper Lee',          'A classic of modern American literature tackling racial injustice in the Deep South.', 1960, 2, 2),
      ('1984',                    'George Orwell',       'A dystopian novel about totalitarianism, surveillance, and the cost of truth.', 1949, 4, 4),
      ('Pride and Prejudice',     'Jane Austen',         'A romantic novel of manners following Elizabeth Bennet as she navigates society and love.', 1813, 2, 2),
      ('The Catcher in the Rye',  'J.D. Salinger',       'Coming-of-age story narrated by the cynical and disenchanted Holden Caulfield.', 1951, 3, 3),
      ('Brave New World',         'Aldous Huxley',       'A futuristic society built on happiness at the cost of freedom and individuality.', 1932, 2, 2),
      ('The Hobbit',              'J.R.R. Tolkien',      'Bilbo Baggins embarks on an unexpected quest with a group of dwarves and the wizard Gandalf.', 1937, 3, 3),
      ('Crime and Punishment',    'Fyodor Dostoevsky',   'A psychological drama about guilt, morality, and redemption in 19th-century Russia.', 1866, 2, 2)
    ON CONFLICT DO NOTHING
  `);

  // Seed sample borrowings only if the table is empty
  const {
    rows: [{ count }],
  } = await pool.query("SELECT COUNT(*) FROM borrowings");

  if (parseInt(count) === 0) {
    // Alice: one active overdue borrow + one returned (history)
    // Bob:   one active non-overdue borrow + one returned (history)
    await pool.query(`
      INSERT INTO borrowings (user_id, book_id, borrow_date, due_date, return_date)
      VALUES
        (
          (SELECT id FROM users WHERE email = 'alice@university.edu'),
          (SELECT id FROM books WHERE title = '1984'),
          '2026-02-01', '2026-03-15', NULL
        ),
        (
          (SELECT id FROM users WHERE email = 'alice@university.edu'),
          (SELECT id FROM books WHERE title = 'Pride and Prejudice'),
          '2026-01-10', '2026-01-24', '2026-01-22'
        ),
        (
          (SELECT id FROM users WHERE email = 'bob@university.edu'),
          (SELECT id FROM books WHERE title = 'The Great Gatsby'),
          '2026-03-10', '2026-04-10', NULL
        ),
        (
          (SELECT id FROM users WHERE email = 'bob@university.edu'),
          (SELECT id FROM books WHERE title = 'To Kill a Mockingbird'),
          '2025-12-01', '2025-12-15', '2025-12-14'
        )
    `);

    // Reflect the two active borrows in available_copies
    await pool.query(`
      UPDATE books
      SET available_copies = available_copies - 1
      WHERE title IN ('1984', 'The Great Gatsby')
    `);
  }

  console.log("✅ Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
