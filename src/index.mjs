import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from './swagger.mjs';
import swaggerUi from 'swagger-ui-express';
import { JSONFilePreset } from 'lowdb/node';
import { env } from 'node:process';
import path from 'path';
import { __dirname, upload } from './multer.js';
import fs from 'fs';
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
// Use absolute path and ensure directory exists
const dbPath = path.join(__dirname, 'data', 'db.json');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = await JSONFilePreset(dbPath, {
  processes: [],
  devices: [],
});

db.data.processes.push(...initialProcesses);
db.data.devices.push(...initialDevices);
await db.write();

//helper function to calculate required action based on status
function calculateRequiredAction(status) {
  switch (status) {
    case 'started':
      return {
        client: 'noActionRequired',
        technician: 'addCost',
      };
    case 'cost_added':
      return {
        client: 'paymentRequired',
        technician: 'noActionRequired',
      };
    case 'confirmed':
    case 'repaired':
      return {
        client: 'noActionRequired',
        technician: 'changeProcessStatus',
      };
    default:
      return {
        client: 'noActionRequired',
        technician: 'noActionRequired',
      };
  }
}

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

    // Exclude image field from device object in list endpoint
    let deviceWithoutImage = deviceObj;
    if (deviceObj && deviceObj.image) {
      deviceWithoutImage = { ...deviceObj };
      delete deviceWithoutImage.image;
    }

    return {
      ...process,
      client: clientObj,
      technician: technicianObj,
      employee: employeeObj,
      device: deviceWithoutImage,
    };
  });
  //simulate a delay
  setTimeout(() => {
    res.json(enrichedData);
  }, 1000);
});

//get one process for a given process id
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

  // Enrich device with photo URL if image exists
  let enrichedDeviceObj = deviceObj;
  if (deviceObj && deviceObj.image && deviceObj.image.filename) {
    const photoUrl = `/photos/${deviceObj.image.filename}`;
    enrichedDeviceObj = {
      ...deviceObj,
      image: {
        ...deviceObj.image,
        url: photoUrl,
      },
    };
  }

  const enrichedProcess = {
    ...process,
    client: clientObj,
    technician: technicianObj,
    employee: employeeObj,
    device: enrichedDeviceObj,
    requiredAction: calculateRequiredAction(process.status),
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
app.put('/process/:processId', async (req, res) => {
  const { processId } = req.params;
  const processIdNum = processId ? parseInt(processId, 10) : -1;
  const process = db.data.processes.find((p) => p.processId === processIdNum);
  const { newRequiredAction, expectedCost } = req.body;
  //pithana actions
  const possibleNotifications = [
  'noActionRequired',
  'paymentRequired',
  'changeProcessStatus',
  'confirmReplacement',
  'addCost',        // new
  'paymentAccept',  // new
];
  if (!possibleNotifications.includes(newRequiredAction)) {
    return res.status(400).json({ error: 'Invalid required action' });
  }
  if (process) {
    // change process status
    if (newRequiredAction === 'changeProcessStatus') {
      if (process.status === 'started') {
        const updatedProcess = {
          ...process,
          status: 'confirmed',
          updatedAt: new Date().toISOString(),
          notifications: [
            ...process.notifications,
            {
              id: process.notifications.length + 1,
              title: 'Process updated',
              message: 'Your Process confirmed',
              createdAt: new Date().toISOString(),
            },
          ],
        };
        db.data.processes = db.data.processes.map((p) => (p.processId === processIdNum ? updatedProcess : p));
        await db.write();
        setTimeout(() => {
          res.json(updatedProcess);
        }, 1000);
      } else if (process.status === 'confirmed') {
        const updatedProcess = {
          ...process,
          status: 'repaired',
          updatedAt: new Date().toISOString(),
          notifications: [
            ...process.notifications,
            {
              id: process.notifications.length + 1,
              title: 'Process updated',
              message: 'Your Process repaired',
              createdAt: new Date().toISOString(),
            },
          ],
        };
        db.data.processes = db.data.processes.map((p) => (p.processId === processIdNum ? updatedProcess : p));
        await db.write();
        setTimeout(() => {
          res.json(updatedProcess);
        }, 1000);
      } else if (process.status === 'repaired') {
        const updatedProcess = {
          ...process,
          status: 'completed',
          updatedAt: new Date().toISOString(),
          notifications: [
            ...process.notifications,
            {
              id: process.notifications.length + 1,
              title: 'Process updated',
              message: 'Your Process completed',
              createdAt: new Date().toISOString(),
            },
          ],
        };
        db.data.processes = db.data.processes.map((p) => (p.processId === processIdNum ? updatedProcess : p));
        await db.write();
        setTimeout(() => {
          res.json(updatedProcess);
        }, 1000);
      }
    }
    //confirm replacement
    if (newRequiredAction === 'confirmReplacement') {
      const updatedProcess = {
        ...process,
        status: 'completed',
        updatedAt: new Date().toISOString(),
        notifications: [
          ...process.notifications,
          {
            id: process.notifications.length + 1,
            title: 'Process updated',
            message: 'Your Process completed',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      db.data.processes = db.data.processes.map((p) => (p.processId === processIdNum ? updatedProcess : p));
      await db.write();
      setTimeout(() => {
        res.json(updatedProcess);
      }, 1000);
    }
  } else {
    res.status(404).json({ error: 'Process not found' });
  }
});

//create a new process
app.post('/process', (req, res) => {
  const { process, device, user } = req.body;
  const newDevice = {
    id: db.data.devices.length + 1,
    name: device.name,
    description: device.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: 'Phones',
    warrantyType: 'basic',
    warrantyExpires: '2026-12-02',
    image: null,
  };
  db.data.devices.push(newDevice);
  const newProcess = {
    processId: db.data.processes.length + 1,
    issue: process.issue ?? 'No issue reported',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expectedCost: 0,
    requiredAction: 'changeProcessStatus',
    type: process.type ?? 'repair',
    device: newDevice.id,
    client: user.id,
    technician: 1,
    employee: 1,
    notifications: [],
  };

  db.data.processes.push(newProcess);
  //simulate a delay
  setTimeout(() => {
    res.json(newProcess);
  }, 1000);
});

// Upload photo for a device
app.post('/device/:deviceId/photo', upload.single('photo'), (req, res) => {
  const { deviceId } = req.params;
  const deviceIdNum = parseInt(deviceId, 10);

  if (!req.file) {
    return res.status(400).json({ error: 'No photo file provided' });
  }

  const device = db.data.devices.find((d) => d.id === deviceIdNum || d.deviceId === deviceIdNum);
  if (!device) {
    // Delete uploaded file if device doesn't exist
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Device not found' });
  }

  // Delete old photo file if it exists
  // if (device.image && device.image.filename) {
  //   const oldPhotoPath = path.join(__dirname, 'data', 'photos', device.image.filename);
  //   if (fs.existsSync(oldPhotoPath)) {
  //     try {
  //       fs.unlinkSync(oldPhotoPath);
  //     } catch (err) {
  //       console.error('Error deleting old photo:', err);
  //     }
  //   }
  // }
  // store photo
  // const photoUrl = `/photos/${req.file.filename}`;
  // device.image = {
  //   filename: req.file.filename,
  //   url: photoUrl,
  //   uploadedAt: new Date().toISOString(),
  // };
  // // save to database
  // db.write();

  res.json({
    message: 'Photo uploaded successfully',
    photo: {
      filename: req.file.filename,
      // url: photoUrl,
    },
  });
});

// Serve static files from photos directory
app.use('/photos', express.static(path.join(__dirname, 'data', 'photos')));
// Listen on selected port
// the second argument is a callback function that is called when the server has started
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
