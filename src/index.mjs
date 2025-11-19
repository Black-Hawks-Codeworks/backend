import express from 'express';
import { env } from 'node:process';
import { Pool } from 'pg';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { swaggerOptions } from './swagger.mjs';

// Create an express application
const app = express();
app.use(express.json());

const swaggerDocs = swaggerJsdoc(swaggerOptions);
// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT = env.PORT;
console.log(env.PORT);

// Database configuration
const pool = new Pool({
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  host: env.POSTGRES_HOST,
  port: Number(env.POSTGRES_PORT),
  database: env.POSTGRES_DB,
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
    console.log(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Listen on selected port
// the second argument is a callback function that is called when the server has started
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
