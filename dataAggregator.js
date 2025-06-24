const data = [
  {
    inverterId: "INV123",
    timestamp: "2025-04-19T10:05:00Z",
    voltage: 230.5,
    current: 4.2,
    power: 967.1,
  },
  {
    inverterId: "INV124",
    timestamp: "2025-04-19T10:06:00Z",
    voltage: 230.5,
    current: 4.2,
    power: 800,
  },
  {
    inverterId: "INV123",
    timestamp: "2025-04-19T10:07:10Z",
    voltage: 230.5,
    current: 4.2,
    power: 700,
  },
  {
    inverterId: "INV123",
    timestamp: "2025-04-19T10:25:11Z",
    voltage: 230.5,
    current: 4.2,
    power: 2,
  },
  {
    inverterId: "INV124",
    timestamp: "2025-04-19T10:06:00Z",
    voltage: 230.5,
    current: 4.2,
    power: 1200,
  },
];

// {
//     "INV123": {
//     "2025-04-19T10:00:00Z": 951.3,
//     "2025-04-19T11:00:00Z": 1023.8
//     }
// }

function aggregateHourlyData(data) {
  const aggregateData = {};

  for (const entry of data) {
    const inverterId = entry.inverterId;
    const power = entry.power;
    const currentTime = entry.timestamp;
    const dateHour = new Date(currentTime);
    dateHour.setMinutes(0);
    dateHour.setSeconds(0);
    const key = dateHour.toISOString();

    if (!aggregateData[inverterId]) {
      aggregateData[inverterId] = {};
    }

    if (!aggregateData[inverterId][key]) {
      aggregateData[inverterId][key] = {};
      aggregateData[inverterId][key]["sum"] = 0;
      aggregateData[inverterId][key]["count"] = 0;
    }
    aggregateData[inverterId][key]["sum"] += power;
    aggregateData[inverterId][key]["count"] += 1;
  }

  for (const inverterId in aggregateData) {
    const hourlyEntries = aggregateData[inverterId];
    for (const timestamp in hourlyEntries) {
      const { sum, count } = hourlyEntries[timestamp];
      hourlyEntries[timestamp] = sum / count;
    }
  }

  return aggregateData;
}

console.log(aggregateHourlyData(data));
