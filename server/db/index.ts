import { Pool, types } from "pg";

types.setTypeParser(types.builtins.DATE, (val: string) => val);

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _pool = new Pool({
      connectionString,
      idleTimeoutMillis: 5000,
    });
  }
  return _pool;
}