import { config } from 'dotenv';
import { Pool } from 'pg';

config();

let pool: Pool;

pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT as string),
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
});

export { pool };