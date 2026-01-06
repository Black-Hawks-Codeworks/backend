//helper function to calculate required action based on status
export function calculateRequiredAction(status) {
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

export function calculateWarranty(purchaceDate) {
  const possibleWarranties = {
    basic: 1,
    premium: 2,
    none: 3,
  };
  const warantyRandom = Math.floor(Math.random() * 3) + 1;
  const warrantyType = possibleWarranties[warantyRandom];

  if (warrantyType === 'basic') {
    return {
      type: warrantyType,
      expires: new Date(new Date(purchaceDate).setDate(new Date(purchaceDate).getDate() + 14)).toISOString(),
    };
  }
  if (warrantyType === 'premium') {
    return {
      type: warrantyType,
      expires: new Date(purchaceDate.setFullYear(purchaceDate.getFullYear() + 2)).toISOString(),
    };
  }
  if (warrantyType === 'none') {
    return {
      type: warrantyType,
      expires: new Date().toISOString(),
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
