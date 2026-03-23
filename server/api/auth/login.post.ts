import { defineEventHandler, readBody, setCookie, createError } from "h3";
import bcrypt from "bcryptjs";
import { getPool } from "~/server/db/index";
import { signToken } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body ?? {};

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  }

  const pool = getPool();
  const result = await pool.query(
    "SELECT id, name, surname, email, password, student_id FROM users WHERE email = $1",
    [email],
  );

  const user = result.rows[0];

  // Use constant-time comparison; same message for missing user and wrong password
  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !valid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  const token = signToken({ userId: user.id, email: user.email });

  setCookie(event, "auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      student_id: user.student_id,
    },
  };
});
