import { defineEventHandler, readBody, createError } from "h3";
import { requireAuth } from "~/server/utils/auth";
import { getPool } from "~/server/db/index";

// Library opening hours by day-of-week (0 = Sun, 6 = Sat)
function getLibraryHours(date: string): { open: string; close: string } | null {
  const day = new Date(date + "T12:00:00").getDay();
  if (day >= 1 && day <= 5) return { open: "08:30", close: "20:30" };
  if (day === 6) return { open: "08:30", close: "17:30" };
  if (day === 0) return { open: "09:30", close: "13:30" };
  return null;
}

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const body = await readBody(event);
  const { roomId, date, startTime, endTime } = body ?? {};

  if (!roomId || !date || !startTime || !endTime) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Missing required fields: roomId, date, startTime, endTime",
    });
  }

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid date format",
    });
  }

  // Reject past dates
  const today = new Date().toISOString().split("T")[0];
  if (date < today) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot reserve a room for a past date",
    });
  }

  // Validate against library hours
  const hours = getLibraryHours(date);
  if (!hours) {
    throw createError({
      statusCode: 400,
      statusMessage: "Library is closed on this day",
    });
  }
  if (startTime < hours.open || endTime > hours.close || startTime >= endTime) {
    throw createError({
      statusCode: 400,
      statusMessage: `Reservation must be within library hours (${hours.open} – ${hours.close})`,
    });
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verify room exists
    const roomRow = await client.query("SELECT id FROM rooms WHERE id = $1", [
      parseInt(roomId),
    ]);
    if (roomRow.rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: "Room not found" });
    }

    // Check room is not already booked in this time window
    const roomConflict = await client.query(
      `SELECT id FROM reservations
       WHERE room_id = $1
         AND reservation_date = $2
         AND start_time < $4::time
         AND end_time   > $3::time`,
      [parseInt(roomId), date, startTime, endTime],
    );
    if (roomConflict.rows.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage:
          "This room is already reserved for the selected time slot",
      });
    }

    // Enforce one reservation per student per overlapping time window
    const userConflict = await client.query(
      `SELECT id FROM reservations
       WHERE user_id = $1
         AND reservation_date = $2
         AND start_time < $4::time
         AND end_time   > $3::time`,
      [auth.userId, date, startTime, endTime],
    );
    if (userConflict.rows.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: "You already have a reservation during this time slot",
      });
    }

    const result = await client.query(
      `INSERT INTO reservations (user_id, room_id, reservation_date, start_time, end_time)
       VALUES ($1, $2, $3, $4::time, $5::time)
       RETURNING id`,
      [auth.userId, parseInt(roomId), date, startTime, endTime],
    );

    await client.query("COMMIT");
    return { id: result.rows[0].id, message: "Room reserved successfully" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});
