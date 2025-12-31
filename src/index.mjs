import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from './swagger.mjs';
import swaggerUi from 'swagger-ui-express';
import { JSONFilePreset } from 'lowdb/node';
import { env } from 'node:process';

import { managers } from './data/managers.js';
import { employees } from './data/employees.js';
import { clients } from './data/clients.js';
import { technicians } from './data/technicians.js';
// Create an express application
const app = express();
app.use(express.json());

const swaggerDocs = swaggerJsdoc(swaggerOptions);
// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT = env.PORT;
console.log(env.PORT);

//lowdb initialisation
const processes = { processes: [] };
const db = await JSONFilePreset('./data/processes.json', processes);
console.log(db);

//psaxe ton hristi
app.post('/auth/login', (req, res) => {
  const possibleUsers = [...managers, ...employees, ...clients, ...technicians];
  const { username, password } = req.body;
  const user = possibleUsers.find((u) => u.username === username && u.password === password);
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

app.get('/technician/processes', (req, res) => {
  const { technicianId } = req.body;
  const technicianProcesses = db.data.processes.filter((p) => p.technician === technicianId);
  if (technicianProcesses && technicianProcesses.length > 0) {
    res.json(technicianProcesses);
  } else {
    res.json([]);
  }
});

app.get('/employee/processes', (req, res) => {
  const { employeeId } = req.body;
  const employeeProcesses = db.data.processes.filter((p) => p.employee === employeeId);
  if (employeeProcesses && employeeProcesses.length > 0) {
    res.json(employeeProcesses);
  } else {
    res.json([]);
  }
});

app.get('/client/processes', (req, res) => {
  const { clientId } = req.body;
  const clientProcesses = db.data.processes.filter((p) => p.client === clientId);
  if (clientProcesses && clientProcesses.length > 0) {
    res.json(clientProcesses);
  } else {
    res.json([]);
  }
});
// Listen on selected port
// the second argument is a callback function that is called when the server has started
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
