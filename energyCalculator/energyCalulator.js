const { DateTime } = require("luxon");

function getEnergyToday(data, targetDate = "2025-04-19", timezone = "UTC") {
  const MS_PER_HOUR = 3600000;
  let totalEnergyWh = 0;

  const startOfDay = DateTime.fromISO(targetDate, { zone: timezone }).startOf(
    "day"
  );
  const endOfDay = startOfDay.endOf("day");

  for (let i = 1; i < data.length; i++) {
    const prevTime = DateTime.fromISO(data[i - 1].timestamp, {
      zone: timezone,
    });
    const currTime = DateTime.fromISO(data[i].timestamp, { zone: timezone });

    if (prevTime >= startOfDay && currTime <= endOfDay) {
      const prev = data[i - 1];
      const curr = data[i];

      const avgPower =
        (prev.voltage * prev.current + curr.voltage * curr.current) / 2; // Watts
      const durationHours = currTime.diff(prevTime).milliseconds / MS_PER_HOUR; // Hours

      totalEnergyWh += avgPower * durationHours;
    }
  }

  return totalEnergyWh;
}

const mockData = [
  { timestamp: "2025-04-18T23:00:00Z", voltage: 230, current: 0.5 },
  { timestamp: "2025-04-19T00:00:00Z", voltage: 230, current: 1.0 },
  { timestamp: "2025-04-19T01:00:00Z", voltage: 230, current: 1.5 },
  { timestamp: "2025-04-19T02:00:00Z", voltage: 230, current: 1.2 },
  { timestamp: "2025-04-19T03:00:00Z", voltage: 230, current: 1.8 },
  { timestamp: "2025-04-19T04:00:00Z", voltage: 230, current: 2.0 },
  { timestamp: "2025-04-19T23:00:00Z", voltage: 230, current: 1.0 },
  { timestamp: "2025-04-20T00:00:00Z", voltage: 230, current: 0.8 },
];

const energy = getEnergyToday(mockData, "2025-04-19", "IST");
console.log(`Total energy on 2025-04-19 (India): ${energy.toFixed(2)} Wh`);
