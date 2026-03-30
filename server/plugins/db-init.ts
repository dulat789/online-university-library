import { getPool } from "~/server/db/index";

export default defineNitroPlugin(async () => {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100)  NOT NULL,
      surname     VARCHAR(100)  NOT NULL,
      email       VARCHAR(255)  UNIQUE NOT NULL,
      password    VARCHAR(255)  NOT NULL,
      student_id  VARCHAR(50)   UNIQUE NOT NULL,
      created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id                SERIAL PRIMARY KEY,
      title             VARCHAR(500)  NOT NULL,
      author            VARCHAR(255)  NOT NULL,
      description       TEXT,
      year              INTEGER       CHECK (year > 0),
      total_copies      INTEGER  NOT NULL DEFAULT 1  CHECK (total_copies > 0),
      available_copies  INTEGER  NOT NULL DEFAULT 1
                          CONSTRAINT chk_available_copies
                            CHECK (available_copies >= 0 AND available_copies <= total_copies),
      created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS borrowings (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER  NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
      book_id      INTEGER  NOT NULL REFERENCES books(id)  ON DELETE CASCADE,
      borrow_date  DATE     NOT NULL,
      due_date     DATE     NOT NULL
          CONSTRAINT chk_due_after_borrow CHECK (due_date > borrow_date),
      return_date  DATE
          CONSTRAINT chk_return_after_borrow CHECK (return_date IS NULL OR return_date >= borrow_date),
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_borrowings_user_id ON borrowings(user_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_borrowings_book_id ON borrowings(book_id)
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_borrowings_active
      ON borrowings(user_id, book_id)
      WHERE return_date IS NULL
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_borrowings_active
      ON borrowings(user_id)
      WHERE return_date IS NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id    SERIAL PRIMARY KEY,
      name  VARCHAR(50) NOT NULL UNIQUE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id               SERIAL PRIMARY KEY,
      user_id          INTEGER  NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
      room_id          INTEGER  NOT NULL REFERENCES rooms(id)  ON DELETE CASCADE,
      reservation_date DATE     NOT NULL,
      start_time       TIME     NOT NULL,
      end_time         TIME     NOT NULL,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_reservations_date
      ON reservations(reservation_date)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_reservations_room_date
      ON reservations(room_id, reservation_date)
  `);

  // Seed the 5 study rooms if none exist yet
  await pool.query(`
    INSERT INTO rooms (name)
    VALUES
      ('Study Room 1'),
      ('Study Room 2'),
      ('Study Room 3'),
      ('Study Room 4'),
      ('Study Room 5')
    ON CONFLICT (name) DO NOTHING
  `);

  console.log("✅ DB initialised");
});
