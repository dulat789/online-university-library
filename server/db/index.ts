import { Pool, types } from "pg";

types.setTypeParser(types.builtins.DATE, (val: string) => val);

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      _pool = new Pool({ connectionString, idleTimeoutMillis: 5000 });
    } else {
      _pool = new Pool({
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME || "library",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        idleTimeoutMillis: 5000,
      });
    }
  }
  return _pool;
}