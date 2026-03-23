import { defineEventHandler, getRouterParam, createError } from "h3";
import { requireAuth } from "~/server/utils/auth";
import { getPool } from "~/server/db/index";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const bookId = getRouterParam(event, "bookId");

  if (!bookId || isNaN(parseInt(bookId))) {
    throw createError({ statusCode: 400, statusMessage: "Invalid book ID" });
  }

  const bookIdNum = parseInt(bookId);
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the book row to prevent concurrent over-borrowing
    const bookResult = await client.query(
      "SELECT id, available_copies FROM books WHERE id = $1 FOR UPDATE",
      [bookIdNum],
    );

    const book = bookResult.rows[0];
    if (!book) {
      throw createError({ statusCode: 404, statusMessage: "Book not found" });
    }

    if (book.available_copies <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No available copies",
      });
    }

    // Prevent duplicate active borrowing for the same user + book
    const existingBorrow = await client.query(
      "SELECT id FROM borrowings WHERE user_id = $1 AND book_id = $2 AND return_date IS NULL",
      [auth.userId, bookIdNum],
    );

    if (existingBorrow.rows.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "You already have this book borrowed",
      });
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const borrowResult = await client.query(
      `INSERT INTO borrowings (user_id, book_id, borrow_date, due_date, return_date)
       VALUES ($1, $2, $3, $4, NULL)
       RETURNING id, user_id, book_id, borrow_date, due_date, return_date`,
      [auth.userId, bookIdNum, today, dueDate],
    );

    await client.query(
      "UPDATE books SET available_copies = available_copies - 1 WHERE id = $1",
      [bookIdNum],
    );

    await client.query("COMMIT");
    return borrowResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});
