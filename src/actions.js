// Technician adds cost
export async function technicianRequestedPayment(process, expectedCost, db, processIdNum, res) {
  const updatedProcess = {
    ...process,
    expectedCost: expectedCost,
    updatedAt: new Date().toISOString(),
    notifications: [
      ...process.notifications,
      {
        id: process.notifications.length + 1,
        title: 'Payment Required',
        message: `Additional cost of ${expectedCost}€ is required to complete the repairs`,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  db.data.processes = db.data.processes.map((p) => (p.processId === processIdNum ? updatedProcess : p));
  await db.write();
  return res.json(updatedProcess);
}

// Customer accepts payment
export async function customerAcceptPayment(process, db, processIdNum, res) {
  const updatedProcess = {
    ...process,
    status: 'confirmed',
    updatedAt: new Date().toISOString(),
    notifications: [
      ...process.notifications,
      {
        id: process.notifications.length + 1,
        title: 'Payment Accepted',
        message: 'Customer accepted the additional cost',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  db.data.processes = db.data.processes.map((p) => (p.processId === processIdNum ? updatedProcess : p));
  await db.write();
  return res.json(updatedProcess);
}

// change process status (next step)
export async function changeProcessStatus(process, db, processIdNum, res) {
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
    return setTimeout(() => {
      res.json(updatedProcess);
    }, 1000);
  }

  if (process.status === 'confirmed') {
    const updatedProcess = {
      ...process,
      status: 'processing',
      updatedAt: new Date().toISOString(),
      notifications: [
        ...process.notifications,
        {
          id: process.notifications.length + 1,
          title: 'Process updated',
          message: 'Your Process processing',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    db.data.processes = db.data.processes.map((p) => (p.processId === processIdNum ? updatedProcess : p));
    await db.write();
    return setTimeout(() => {
      res.json(updatedProcess);
    }, 1000);
  }

  if (process.status === 'processing') {
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
    return setTimeout(() => {
      res.json(updatedProcess);
    }, 1000);
  }
}

// employee confirms replacement
export async function employeeConfirmedReplacement(process, db, processIdNum, res) {
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
  return setTimeout(() => {
    res.json(updatedProcess);
  }, 1000);
}

// customer declines payment
export async function customerDeclinePayment(process, db, processIdNum, res) {
  const updatedProcess = {
    ...process,
    status: 'completed',
    updatedAt: new Date().toISOString(),
    notifications: [
      ...process.notifications,
      {
        id: process.notifications.length + 1,
        title: 'Process Completed',
        message: 'This Process has been cancelled by the customer',
        createdAt: new Date().toISOString(),
      },
    ],
  };
  db.data.processes = db.data.processes.map((p) => (p.processId === processIdNum ? updatedProcess : p));
  await db.write();
  return setTimeout(() => {
    res.json(updatedProcess);
  }, 1000);
}
