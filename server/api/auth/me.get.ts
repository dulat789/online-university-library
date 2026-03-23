import { defineEventHandler, createError } from "h3";
import { requireAuth } from "~/server/utils/auth";
import { getPool } from "~/server/db/index";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const pool = getPool();

  const result = await pool.query(
    "SELECT id, name, surname, email, student_id FROM users WHERE id = $1",
    [auth.userId],
  );

  if (!result.rows[0]) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return result.rows[0];
});
