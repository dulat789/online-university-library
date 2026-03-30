import { defineEventHandler, getQuery, createError } from "h3";
import { getPool } from "~/server/db/index";

export default defineEventHandler(async (event) => {
  const { date } = getQuery(event);

  if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or missing date parameter (expected YYYY-MM-DD)",
    });
  }

  const pool = getPool();
  const result = await pool.query(
    `SELECT
       r.id,
       r.user_id,
       r.room_id,
       r.reservation_date,
       to_char(r.start_time, 'HH24:MI') AS start_time,
       to_char(r.end_time,   'HH24:MI') AS end_time,
       r.created_at,
       u.name || ' ' || LEFT(u.surname, 1) || '.' AS user_name
     FROM reservations r
     JOIN users u ON u.id = r.user_id
     WHERE r.reservation_date = $1
     ORDER BY r.start_time, r.room_id`,
    [date],
  );

  return result.rows;
});
