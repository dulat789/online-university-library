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

    const borrowResult = await client.query(
      `SELECT id FROM borrowings
       WHERE user_id = $1 AND book_id = $2 AND return_date IS NULL
       FOR UPDATE`,
      [auth.userId, bookIdNum],
    );

    if (!borrowResult.rows[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: "No active borrowing found for this book",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const updatedBorrow = await client.query(
      `UPDATE borrowings SET return_date = $1 WHERE id = $2
       RETURNING id, user_id, book_id, borrow_date, due_date, return_date`,
      [today, borrowResult.rows[0].id],
    );

    await client.query(
      "UPDATE books SET available_copies = available_copies + 1 WHERE id = $1",
      [bookIdNum],
    );

    await client.query("COMMIT");
    return updatedBorrow.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});
