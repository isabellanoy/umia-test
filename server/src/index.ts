import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Pool } from 'pg';
import 'dotenv/config';

const app = new Hono();

app.use('/*', cors());

// Conexión a la Base de Datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// rutas

// al Endpoint BFF: Traer películas de la API externa
app.get('/api/movies', async (c) => {
  try {
    const response = await fetch('https://the-one-api.dev/v2/movie', {
      headers: {
        'Authorization': `Bearer ${process.env.THE_ONE_API_TOKEN}`
      }
    });
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Error conectando con API externa' }, 500);
  }
});

// Endpoint lee reseñas de una película (desde Postgres)
app.get('/api/reviews/:movieId', async (c) => {
  const movieId = c.req.param('movieId');
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE movie_id = $1 ORDER BY created_at DESC', 
      [movieId]
    );
    return c.json(result.rows);
  } catch (error) {
    return c.json({ error: 'Error leyendo reseñas' }, 500);
  }
});

// endpoint crea una reseña nueva (Guarda en la bd)
app.post('/api/reviews', async (c) => {
  const body = await c.req.json();
  
  if (!body.movie_id || !body.content || !body.user_name) {
    return c.json({ error: 'Faltan datos' }, 400);
  }

  try {
    const result = await pool.query(
      'INSERT INTO reviews (movie_id, user_name, content) VALUES ($1, $2, $3) RETURNING *',
      [body.movie_id, body.user_name, body.content]
    );
    return c.json(result.rows[0], 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Error guardando reseña' }, 500);
  }
});

// mensaje de exito
app.get('/', (c) => c.text('El servidor está corriendo correctamente.'));

// Iniciar servidor en puerto 3000
console.log('Servidor corriendo en http://localhost:3000');
serve({
  fetch: app.fetch,
  port: 3000
});