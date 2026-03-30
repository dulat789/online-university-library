import { defineEventHandler, getRouterParam, createError } from "h3";
import { requireAuth } from "~/server/utils/auth";
import { getPool } from "~/server/db/index";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const idParam = getRouterParam(event, "id");
  const id = parseInt(idParam ?? "");

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid reservation ID",
    });
  }

  const pool = getPool();
  const result = await pool.query(
    "SELECT id, user_id, reservation_date FROM reservations WHERE id = $1",
    [id],
  );

  if (result.rows.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Reservation not found",
    });
  }

  const reservation = result.rows[0];

  if (reservation.user_id !== auth.userId) {
    throw createError({
      statusCode: 403,
      statusMessage: "You can only cancel your own reservations",
    });
  }

  // Prevent cancelling reservations for past dates
  const today = new Date().toISOString().split("T")[0];
  if (reservation.reservation_date < today) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot cancel a past reservation",
    });
  }

  await pool.query("DELETE FROM reservations WHERE id = $1", [id]);
  return { message: "Reservation cancelled successfully" };
});
