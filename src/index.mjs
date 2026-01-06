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
import {
  calculateRequiredAction,
  calculateTechnicianAssignment,
  calculateEmployeeAssignment,
  calculateWarranty,
} from './utils.js';
import { managers } from './data/managers.js';
import { employees } from './data/employees.js';
import { clients } from './data/clients.js';
import { technicians } from './data/technicians.js';
import {
  technicianAddCost,
  customerAcceptPayment,
  changeProcessStatus,
  employeeConfirmReplacement,
} from './actions.js';


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

//psaxe ton hristi
//done
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
//done
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
      data = db.data.processes.filter(
    (p) => p.employee === userIdNum && p.type === 'return');
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
//done
app.get('/process/:processId', (req, res) => {
  const { processId } = req.params;
  const processIdNum = processId ? parseInt(processId, 10) : -1;

  const process = db.data.processes.find((p) => p.processId === processIdNum);
  if (!process) {
    return res.status(404).json({ error: 'Process not found' });
  }
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
    requiredAction: calculateRequiredAction(process.status,process.type),
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

  const possibleActions = [
    'noActionRequired',
    'paymentRequired',
    'changeProcessStatus',
    'confirmReplacement',
    'addCost',
    'paymentAccept',
  ];

  if (!possibleActions.includes(newRequiredAction)) {
    return res.status(400).json({ error: 'Invalid required action' });
  }
  if (!process) {
    return res.status(404).json({ error: 'Process not found' });
  }

  if (newRequiredAction === 'addCost') {
    return technicianAddCost(process, expectedCost, db, processIdNum, res);
  }

  if (newRequiredAction === 'paymentAccept') {
    return customerAcceptPayment(process, db, processIdNum, res);
  }

  if (newRequiredAction === 'changeProcessStatus') {
    return changeProcessStatus(process, db, processIdNum, res);
  }

  if (newRequiredAction === 'confirmReplacement') {
    return employeeConfirmReplacement(process, db, processIdNum, res);
  }

  return res.status(400).json({ error: 'Unhandled required action' });
});
//create a new process
app.post('/process', async (req, res) => {
  const { process, device, user } = req.body;
  const newDevice = {
    id: db.data.devices.length + 1,
    name: device.name,
    purchaceDate: device.purchaceDate,
    description: device.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: device.category,
    warranty: calculateWarranty(device.purchaceDate),
    image: {
      filename: 'no-image-available.webp',
      url: '/photos/no-image-available.webp',
      uploadedAt: new Date().toISOString(),
    },
  };
  db.data.devices.push(newDevice);
  const newRequiredAction = {
    client: 'noActionRequired',
    technician: process.type === 'repair' ? 'noActionRequired' : 'changeProcessStatus',
    employee: process.type === 'return' ? 'noActionRequired' : 'changeProcessStatus',
  };
  const newProcess = {
  processId: db.data.processes.length + 1,
  issue: process.issue ?? 'No issue reported',
  status: 'started',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  expectedCost: 0,
  type: process.type ?? 'repair',
  device: newDevice.id,
  client: user.id,
  technician: calculateTechnicianAssignment(db.data.processes),
  employee: calculateEmployeeAssignment(employees),
  notifications: [
    {
      id: 1,
      title: 'Process created',
      message: 'Your Process has been created. We are on it!',
      createdAt: new Date().toISOString(),
    },
  ],
};

newProcess.requiredAction = calculateRequiredAction(
  newProcess.status,
  newProcess.type
);

  db.data.processes.push(newProcess);
  await db.write();
  //simulate a delay
  setTimeout(() => {
    res.json(newProcess);
  }, 1000);
});

// Upload photo for a device
//done
app.post('/device/:deviceId/photo', upload.single('photo'), async (req, res) => {
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
  if (device.image && device.image.filename) {
    const oldPhotoPath = path.join(__dirname, 'data', 'photos', device.image.filename);
    if (fs.existsSync(oldPhotoPath)) {
      try {
        fs.unlinkSync(oldPhotoPath);
      } catch (err) {
        console.error('Error deleting old photo:', err);
      }
    }
  }
  //store photo
  const photoUrl = `/photos/${req.file.filename}`;
  device.image = {
    filename: req.file.filename,
    url: photoUrl,
    uploadedAt: new Date().toISOString(),
  };
  // save to database
  await db.write();

  res.json({
    message: 'Photo uploaded successfully',
    photo: {
      filename: device.image.filename,
      url: device.image.url,
      uploadedAt: device.image.uploadedAt,
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
