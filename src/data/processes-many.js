// Helper function to generate notifications based on status
function generateNotifications(status, createdAt, updatedAt) {
  const notifications = [
    {
      id: 1,
      title: 'Process created',
      message: 'Your Process has been created. We are on it!',
      createdAt: createdAt,
    },
  ];

  if (status === 'confirmed' || status === 'processing' || status === 'completed') {
    notifications.push({
      id: 2,
      title: 'Process updated',
      message: 'The process submission has been confirmed',
      createdAt: updatedAt || createdAt,
    });
  }

  if (status === 'processing' || status === 'completed') {
    notifications.push({
      id: 3,
      title: 'Process updated',
      message: 'The Process processing has been initiated',
      createdAt: updatedAt || createdAt,
    });
  }

  if (status === 'completed') {
    notifications.push({
      id: 4,
      title: 'Process updated',
      message: 'The process processing is now completed',
      createdAt: updatedAt || createdAt,
    });
  }

  return notifications;
}

// Helper function to calculate requiredAction based on type and status
function calculateRequiredAction(type, status) {
  if (status === 'completed') {
    return {
      client: 'noActionRequired',
      technician: 'noActionRequired',
      employee: 'noActionRequired',
    };
  }

  if (type === 'return') {
    return {
      client: 'noActionRequired',
      technician: 'noActionRequired',
      employee: 'changeProcessStatus',
    };
  }

  if (type === 'repair') {
    return {
      employee: 'noActionRequired',
      client: 'noActionRequired',
      technician: 'changeProcessStatus',
    };
  }
}

// Generate dates spread over recent months
function generateDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Issue templates
const repairIssues = [
  'Screen cracked - needs replacement',
  'Battery not holding charge',
  'Device overheating during use',
  'Camera not focusing properly',
  'Speaker volume very low',
  'Touch screen unresponsive in areas',
  'Charging port loose connection',
  'WiFi connectivity issues',
  'Bluetooth not pairing',
  'Device randomly restarts',
  'Display flickering',
  'Microphone not working',
  'Water damage - device not powering on',
  'Button not responding',
  'Software crashes frequently',
];

const returnIssues = [
  'Battery swelling - Safety hazard',
  'Faulty charging port',
  'Device arrived damaged',
  'Wrong model received',
  'Manufacturing defect',
  'Not as described',
  'Missing accessories',
  'Device overheating immediately',
  'Screen dead pixels',
  'Unacceptable performance issues',
];

// Generate processes
const processesMany = [];

let processId = 6; // Start from 6 to avoid conflicts with existing processes

// Track usage to ensure 8-10 appearances per client/technician/employee
const clientCounts = { 1: 0, 2: 0 };
const technicianCounts = { 1: 0, 2: 0 };
const employeeCounts = { 1: 0, 2: 0 };

// Generate repair processes (~18 processes)
const repairStatuses = ['started', 'confirmed', 'processing', 'completed'];
for (let i = 0; i < 18; i++) {
  const client = Math.random() < 0.5 ? 1 : 2;
  const technician = Math.random() < 0.5 ? 1 : 2;
  const employee = Math.random() < 0.5 ? 1 : 2;
  const device = Math.floor(Math.random() * 6) + 1;
  const status = repairStatuses[Math.floor(Math.random() * repairStatuses.length)];

  // Ensure we don't exceed 10 per person, but allow up to 10
  if (clientCounts[client] >= 10) continue;
  if (technicianCounts[technician] >= 10) continue;
  if (employeeCounts[employee] >= 10) continue;

  const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
  const createdAt = generateDate(daysAgo);
  const updatedAt = status === 'started' ? createdAt : generateDate(Math.floor(Math.random() * daysAgo));

  clientCounts[client]++;
  technicianCounts[technician]++;
  employeeCounts[employee]++;

  processesMany.push({
    processId: processId++,
    issue: repairIssues[Math.floor(Math.random() * repairIssues.length)],
    status: status,
    createdAt: createdAt,
    updatedAt: updatedAt,
    expectedCost: status === 'completed' && Math.random() < 0.3 ? Math.floor(Math.random() * 200) + 50 : null,
    requiredAction: calculateRequiredAction('repair', status),
    type: 'repair',
    device: device,
    client: client,
    technician: technician,
    employee: employee,
    notifications: generateNotifications(status, createdAt, updatedAt),
  });
}

// Generate return processes (~18 processes)
for (let i = 0; i < 18; i++) {
  const client = Math.random() < 0.5 ? 1 : 2;
  const employee = Math.random() < 0.5 ? 1 : 2;
  const device = Math.floor(Math.random() * 6) + 1;
  const status = repairStatuses[Math.floor(Math.random() * repairStatuses.length)];

  // Ensure we don't exceed 10 per person, but allow up to 10
  if (clientCounts[client] >= 10) continue;
  if (employeeCounts[employee] >= 10) continue;

  const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
  const createdAt = generateDate(daysAgo);
  const updatedAt = status === 'started' ? createdAt : generateDate(Math.floor(Math.random() * daysAgo));

  clientCounts[client]++;
  employeeCounts[employee]++;

  processesMany.push({
    processId: processId++,
    issue: returnIssues[Math.floor(Math.random() * returnIssues.length)],
    status: status,
    createdAt: createdAt,
    updatedAt: updatedAt,
    expectedCost: null,
    requiredAction: calculateRequiredAction('return', status),
    type: 'return',
    device: device,
    client: client,
    technician: null,
    employee: employee,
    notifications: generateNotifications(status, createdAt, updatedAt),
  });
}

// Ensure minimum 8 appearances per person by adding more processes if needed
// This ensures we meet the 8-10 requirement
const minRequired = 8;

// Add more repair processes if technicians need more
for (let techId = 1; techId <= 2; techId++) {
  while (technicianCounts[techId] < minRequired) {
    const client = Math.random() < 0.5 ? 1 : 2;
    const employee = Math.random() < 0.5 ? 1 : 2;
    const device = Math.floor(Math.random() * 6) + 1;
    const status = repairStatuses[Math.floor(Math.random() * repairStatuses.length)];

    if (clientCounts[client] >= 10) break;
    if (employeeCounts[employee] >= 10) break;

    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = generateDate(daysAgo);
    const updatedAt = status === 'started' ? createdAt : generateDate(Math.floor(Math.random() * daysAgo));

    clientCounts[client]++;
    technicianCounts[techId]++;
    employeeCounts[employee]++;

    processesMany.push({
      processId: processId++,
      issue: repairIssues[Math.floor(Math.random() * repairIssues.length)],
      status: status,
      createdAt: createdAt,
      updatedAt: updatedAt,
      expectedCost: status === 'completed' && Math.random() < 0.3 ? Math.floor(Math.random() * 200) + 50 : null,
      requiredAction: calculateRequiredAction('repair', status),
      type: 'repair',
      device: device,
      client: client,
      technician: techId,
      employee: employee,
      notifications: generateNotifications(status, createdAt, updatedAt),
    });
  }
}

// Add more processes if clients need more
for (let clientId = 1; clientId <= 2; clientId++) {
  while (clientCounts[clientId] < minRequired) {
    const type = Math.random() < 0.5 ? 'repair' : 'return';
    const employee = Math.random() < 0.5 ? 1 : 2;
    const device = Math.floor(Math.random() * 6) + 1;
    const status = repairStatuses[Math.floor(Math.random() * repairStatuses.length)];

    if (employeeCounts[employee] >= 10) break;

    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = generateDate(daysAgo);
    const updatedAt = status === 'started' ? createdAt : generateDate(Math.floor(Math.random() * daysAgo));

    clientCounts[clientId]++;
    employeeCounts[employee]++;

    const process = {
      processId: processId++,
      issue:
        type === 'repair'
          ? repairIssues[Math.floor(Math.random() * repairIssues.length)]
          : returnIssues[Math.floor(Math.random() * returnIssues.length)],
      status: status,
      createdAt: createdAt,
      updatedAt: updatedAt,
      expectedCost:
        type === 'repair' && status === 'completed' && Math.random() < 0.3
          ? Math.floor(Math.random() * 200) + 50
          : null,
      requiredAction: calculateRequiredAction(type, status),
      type: type,
      device: device,
      client: clientId,
      technician: type === 'return' ? null : Math.random() < 0.5 ? 1 : 2,
      employee: employee,
      notifications: generateNotifications(status, createdAt, updatedAt),
    };

    if (type === 'repair') {
      technicianCounts[process.technician]++;
    }

    processesMany.push(process);
  }
}

// Add more processes if employees need more
for (let empId = 1; empId <= 2; empId++) {
  while (employeeCounts[empId] < minRequired) {
    const type = Math.random() < 0.5 ? 'repair' : 'return';
    const client = Math.random() < 0.5 ? 1 : 2;
    const device = Math.floor(Math.random() * 6) + 1;
    const status = repairStatuses[Math.floor(Math.random() * repairStatuses.length)];

    if (clientCounts[client] >= 10) break;

    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = generateDate(daysAgo);
    const updatedAt = status === 'started' ? createdAt : generateDate(Math.floor(Math.random() * daysAgo));

    clientCounts[client]++;
    employeeCounts[empId]++;

    const process = {
      processId: processId++,
      issue:
        type === 'repair'
          ? repairIssues[Math.floor(Math.random() * repairIssues.length)]
          : returnIssues[Math.floor(Math.random() * returnIssues.length)],
      status: status,
      createdAt: createdAt,
      updatedAt: updatedAt,
      expectedCost:
        type === 'repair' && status === 'completed' && Math.random() < 0.3
          ? Math.floor(Math.random() * 200) + 50
          : null,
      requiredAction: calculateRequiredAction(type, status),
      type: type,
      device: device,
      client: client,
      technician: type === 'return' ? null : Math.random() < 0.5 ? 1 : 2,
      employee: empId,
      notifications: generateNotifications(status, createdAt, updatedAt),
    };

    if (type === 'repair') {
      technicianCounts[process.technician]++;
    }

    processesMany.push(process);
  }
}

export { processesMany };
