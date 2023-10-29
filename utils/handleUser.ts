import { pool } from '../config/psql'

const getUserById = async (id: number) => {

  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1;', [id]);
  return rows[0];
}

const getUserByUsername = async (username: string) => {

  const { rows } = await pool.query('SELECT users.id, users.name, users.lastname, users.username, users.email, users.phone, users.password, array_to_json(role) AS role, users.created_at, users.update_at, users.is_active FROM users WHERE users.username = $1', [username]);

  return rows[0];
} 

const checkIfUserExists = async (value: string, field: string) => {

  const query = `SELECT COUNT(*) FROM users WHERE ${field} = $1`;

  const { rows } = await pool.query(query, [value]);

  return rows[0].count > 0;

}

export { getUserById, getUserByUsername, checkIfUserExists };