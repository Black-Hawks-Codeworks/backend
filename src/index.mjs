import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from './swagger.mjs';
import swaggerUi from 'swagger-ui-express';
import { JSONFilePreset } from 'lowdb/node';
import { env } from 'node:process';

import { initialDevices } from './data/devices.js';
import { initialProcesses } from './data/processes.js';

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

const PORT = env.PORT || 3000;
console.log(env.PORT);

//lowdb initialisation
const db = await JSONFilePreset('./data/db.json', {
  processes: initialProcesses,
  devices: initialDevices,
});

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

//all processes for a given user type
app.get('/processes/:userType', (req, res) => {
  const { userId } = req.query;
  const userIdNum = userId ? parseInt(userId, 10) : -1;
  console.log('userId', userIdNum);
  const userType = req.params.userType;
  let data = [];
  console.log('userType', userType);
  console.log('userId', userIdNum);
  switch (userType) {
    case 'technician':
      data = db.data.processes.filter((p) => p.technician === userIdNum);
      break;
    case 'client':
      data = db.data.processes.filter((p) => p.client === userIdNum);
      break;
    case 'employee':
      data = db.data.processes.filter((p) => p.employee === userIdNum);
      break;
    default:
      data = [];
      break;
  }
  console.log('data', data);
  // Map processes to include related objects
  const enrichedData = data.map((process) => {
    const clientObj =
      process.client !== null && process.client !== undefined
        ? clients.find((c) => c.id === process.client) || null
        : null;

    const technicianObj =
      process.technician !== null && process.technician !== undefined
        ? technicians.find((t) => t.id === process.technician) || null
        : null;

    const employeeObj =
      process.employee !== null && process.employee !== undefined
        ? employees.find((e) => e.id === process.employee) || null
        : null;

    const deviceObj =
      process.device !== null && process.device !== undefined
        ? db.data.devices.find((d) => d.id === process.device) || null
        : null;

    return {
      ...process,
      client: clientObj,
      technician: technicianObj,
      employee: employeeObj,
      device: deviceObj,
    };
  });
  console.log('enrichedData', enrichedData);
  //simulate a delay
  setTimeout(() => {
    res.json(enrichedData);
  }, 1000);
});

//one process for a given process id
app.get('/process/:processId', (req, res) => {
  const { processId } = req.params;
  const processIdNum = processId ? parseInt(processId, 10) : -1;
  const process = db.data.processes.find((p) => p.processId === processIdNum);
  const clientObj =
    process.client !== null && process.client !== undefined
      ? clients.find((c) => c.id === process.client) || null
      : null;

  const technicianObj =
    process.technician !== null && process.technician !== undefined
      ? technicians.find((t) => t.id === process.technician) || null
      : null;

  const employeeObj =
    process.employee !== null && process.employee !== undefined
      ? employees.find((e) => e.id === process.employee) || null
      : null;

  const deviceObj =
    process.device !== null && process.device !== undefined
      ? db.data.devices.find((d) => d.id === process.device) || null
      : null;

  const enrichedProcess = {
    ...process,
    client: clientObj,
    technician: technicianObj,
    employee: employeeObj,
    device: deviceObj,
  };
  if (enrichedProcess) {
    //simulate a delays
    setTimeout(() => {
      res.json(enrichedProcess);
    }, 1000);
  } else {
    res.status(404).json({ error: 'Process not found' });
  }
});

//update a process
app.put('/process/:processId', (req, res) => {
  const { processId } = req.params;
  const processIdNum = processId ? parseInt(processId, 10) : -1;
  const process = db.data.processes.find((p) => p.processId === processIdNum);
  const { requiredAction } = req.body;
  if (process) {
    const updatedProcess = {
      ...process,
      requiredAction,
      updatedAt: new Date().toISOString(),
    };
    db.data.processes = db.data.processes.map((p) => (p.processId === processIdNum ? updatedProcess : p));
    //simulate a delay
    setTimeout(() => {
      res.json(updatedProcess);
    }, 1000);
  } else {
    res.status(404).json({ error: 'Process not found' });
  }
});

//create a new process
app.post('/process', (req, res) => {
  const { issue, type, device } = req.body;
  const newProcess = {
    processId: db.data.processes.length + 1,
    issue,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expectedCost: 0,
    requiredAction: 'changeProcessStatus',
    type,
    device,
    client: null,
    technician: null,
    employee: null,
    notifications: [],
  };
  db.data.processes.push(newProcess);
  //simulate a delay
  setTimeout(() => {
    res.json(newProcess);
  }, 1000);
});
// Listen on selected port
// the second argument is a callback function that is called when the server has started
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
