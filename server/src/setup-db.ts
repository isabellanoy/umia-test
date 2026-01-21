import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    movie_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function setup() {
  try {
    console.log('Conectando a la base de datos...');
    await pool.query(createTableQuery);
    console.log('Tabla "reviews" creada exitosamente.');
  } catch (err) {
    console.error('Error creando la tabla:', err);
  } finally {
    await pool.end();
  }
}

setup();