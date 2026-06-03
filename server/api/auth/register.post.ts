import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getPool } from '~/server/db'

export default defineEventHandler(async (event) => {
  const { email, password, name, role = 'student' } = await readBody(event)

  const pool = await getPool()

  // Проверяем, существует ли пользователь
  const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  if (existing.rows.length > 0) {
    throw createError({ statusCode: 400, message: 'Email already exists' })
  }

  // Хэшируем пароль
  const hashedPassword = await bcrypt.hash(password, 10)

  // Вставляем пользователя
  const result = await pool.query(
    'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
    [email, hashedPassword, name, role]
  )

  // Генерируем JWT
  const token = jwt.sign(
    { id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '7d' }
  )

  return { token, user: result.rows[0] }
})