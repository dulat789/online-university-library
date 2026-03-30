import { defineEventHandler } from "h3";
import { getPool } from "~/server/db/index";

export default defineEventHandler(async () => {
  const pool = getPool();
  const result = await pool.query("SELECT id, name FROM rooms ORDER BY id");
  return result.rows;
});
