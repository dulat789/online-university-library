import { defineEventHandler } from "h3";
import { requireAuth } from "~/server/utils/auth";
import { getPool } from "~/server/db/index";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const pool = getPool();

  const result = await pool.query(
    `SELECT
       b.id          AS borrowing_id,
       b.borrow_date,
       b.due_date,
       b.return_date,
       bk.id         AS book_id,
       bk.title,
       bk.author
     FROM borrowings b
     JOIN books bk ON b.book_id = bk.id
     WHERE b.user_id = $1
     ORDER BY b.borrow_date DESC`,
    [auth.userId],
  );

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const current = result.rows
    .filter((row) => row.return_date === null)
    .map((row) => ({
      ...row,
      is_overdue: row.due_date < today,
    }));

  const history = result.rows.filter((row) => row.return_date !== null);

  return { current, history };
});
