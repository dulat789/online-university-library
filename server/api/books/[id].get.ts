import { defineEventHandler, getRouterParam, createError } from "h3";
import { getPool } from "~/server/db/index";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id || isNaN(parseInt(id))) {
    throw createError({ statusCode: 400, statusMessage: "Invalid book ID" });
  }

  const pool = getPool();
  const result = await pool.query(
    "SELECT id, title, author, description, year, total_copies, available_copies FROM books WHERE id = $1",
    [parseInt(id)],
  );

  if (!result.rows[0]) {
    throw createError({ statusCode: 404, statusMessage: "Book not found" });
  }

  return result.rows[0];
});
