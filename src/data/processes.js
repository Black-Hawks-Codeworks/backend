  export const initialProcesses = [
    {
      processId: 1,
      issue: 'I changed my mind! I want to return the device.',
      status: 'started',
      createdAt: '2025-12-02',
      updatedAt: '2025-12-02',
      expectedCost: 0,

      type: 'repair',
      device: 1,
      client: 1,
      technician: 2,
      employee: 2,
      notifications: [
        {
          id: 1,
          title: 'Process created',
          message: 'Your Process has been created. We are on it!',
          createdAt: '2025-12-02',
        },
      ],
    },
    {
      processId: 2,
      issue: 'Battery swelling - I need the device repaired.',
      status: 'started',
      createdAt: '2025-12-02',
      updatedAt: '2025-12-02',
      expectedCost: 160,

      type: 'repair',
      device: 1,
      client: 1,
      technician: 2,
      employee: 1,
      notifications: [
        {
          id: 1,
          title: 'Process created',
          message: 'Your Process has been created. We are on it!',
          createdAt: '2025-12-02',
        },
        {
          id: 2,
          title: 'The device is being repaired.',
          message: 'Your device is being repaired. We will notify you when it is ready.',
          createdAt: '2025-12-02',
        },
      ],
    },
    {
      processId: 3,
      issue: 'Battery swelling - Safety hazard',
      status: 'started',
      createdAt: '2025-12-02',
      updatedAt: '2025-12-02',
      expectedCost: 160,

      type: 'return',
      device: 1,
      client: 1,
      technician: 2,
      employee: 2,
      notifications: [
        {
          id: 1,
          title: 'Battery swelling - Safety hazard',
          message: 'The battery is swelling and is a safety hazard.',
          createdAt: '2025-12-02',
        },
        {
          id: 2,
          title: 'Battery swelling - Safety hazard',
          message: 'The battery is swelling and is a safety hazard.',
          createdAt: '2025-12-02',
        },
      ],
    },
  ];
