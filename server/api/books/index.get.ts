import { defineEventHandler, getQuery } from "h3";
import { getPool } from "~/server/db/index";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search = (query.search as string | undefined)?.trim();

  const pool = getPool();

  let sql =
    "SELECT id, title, author, available_copies, total_copies, year FROM books";
  const params: string[] = [];

  if (search) {
    sql += " WHERE title ILIKE $1 OR author ILIKE $1";
    params.push(`%${search}%`);
  }

  sql += " ORDER BY title ASC";

  const result = await pool.query(sql, params);
  return result.rows;
});
