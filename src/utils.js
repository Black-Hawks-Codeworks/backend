import path from 'path';
import fs from 'fs';
import { JSONFilePreset } from 'lowdb/node';
import { __dirname } from './multer.js';
import { initialProcesses } from './data/processes.js';
import { initialDevices } from './data/devices.js';

//helper function to calculate required action based on status
export function calculateRequiredAction(status, type) {
  if (type === 'return') {
    switch (status) {
      case 'started':
      case 'confirmed':
      case 'processing':
        return {
          client: 'noActionRequired',
          technician: 'noActionRequired',
          employee: 'changeProcessStatus',
        };
      default:
        return {
          client: 'noActionRequired',
          technician: 'noActionRequired',
          employee: 'noActionRequired',
        };
    }
  }

  // repairs
  switch (status) {
    case 'started':
      return {
        client: 'noActionRequired',
        technician: 'changeProcessStatus',
      };
    case 'confirmed':
    case 'processing':
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

export function calculateWarranty(purchaseDate) {
  const warrantyTypes = ['basic', 'premium', 'none'];
  const warantyRandom = Math.floor(Math.random() * 3);
  const warrantyType = warrantyTypes[warantyRandom];

  if (warrantyType === 'basic') {
    return {
      type: warrantyType,
      expiresAt: new Date(new Date(purchaseDate).setDate(new Date(purchaseDate).getDate() + 14)).toISOString(),
    };
  }
  if (warrantyType === 'premium') {
    return {
      type: warrantyType,
      expiresAt: new Date(new Date(purchaseDate).setFullYear(new Date(purchaseDate).getFullYear() + 2)).toISOString(),
    };
  }
  if (warrantyType === 'none') {
    return {
      type: warrantyType,
      expiresAt: new Date().toISOString(),
    };
  }
}

export function calculateTechnicianAssignment(processes) {
  const technicianCounts = {};

  processes.forEach((process) => {
    const technicianId = process.technician;
    if (technicianId && technicianId > 0) {
      technicianCounts[technicianId] = (technicianCounts[technicianId] || 0) + 1;
    }
  });
  // vres to technician id me ta pio polla apotelesmata
  let minCount = Infinity;
  let leastUsedTechnician = null;

  for (const [technicianId, count] of Object.entries(technicianCounts)) {
    if (count < minCount) {
      minCount = count;
      leastUsedTechnician = Number(technicianId);
    }
  }

  return leastUsedTechnician;
}

export function calculateEmployeeAssignment(availableEmployees) {
  // vale ta ids se ena array
  const employeeIds = availableEmployees.map((employee) => employee.id);
  // stin tihi pare enan
  const randomIndex = Math.floor(Math.random() * employeeIds.length);

  return employeeIds[randomIndex];
}

export async function initializeDatabase() {
  const dbPath = path.join(__dirname, 'data', 'db.json');
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const db = await JSONFilePreset(dbPath, {
    processes: [],
    devices: [],
  });

  await db.read();

  //pare ta monadika ids
  const existingProcessIds = new Set(db.data.processes.map((p) => Number(p.processId)));
  const existingDeviceIds = new Set(db.data.devices.map((d) => Number(d.id)));
  //filterare ta initial processes
  const newProcesses = initialProcesses.filter((p) => !existingProcessIds.has(Number(p.processId)));
  const newDevices = initialDevices.filter((d) => !existingDeviceIds.has(Number(d.id)));

  if (newProcesses.length > 0) {
    db.data.processes.push(...newProcesses);
  }
  if (newDevices.length > 0) {
    db.data.devices.push(...newDevices);
  }

  // grapse mono ta kenourgia
  if (newProcesses.length > 0 || newDevices.length > 0) {
    await db.write();
  }

  return db;
}
