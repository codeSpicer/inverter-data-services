const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const alerts = [];
let alertIdCounter = 1;

const inverterStates = {};

const MIN_POWER_THRESHOLD = 10;
const MIN_POWER_DURATION_MINUTES = 5;
const MAX_VOLTAGE_THRESHOLD = 270;

function createAlert(inverterId, type, message) {
  const newAlert = {
    id: alertIdCounter++,
    inverterId: inverterId,
    type: type,
    message: message,
    timestamp: new Date().toISOString(),
  };
  alerts.push(newAlert);
  console.log(
    `[ALERT TRIGGERED] Inverter: ${inverterId}, Type: ${type}, Message: ${message}`
  );
}

function processIncomingTelemetry(data) {
  const { inverterId, power, voltage, timestamp } = data;

  if (!inverterStates[inverterId]) {
    inverterStates[inverterId] = {
      powerReadings: [],
      lowPowerConsecutiveMinutes: 0,
      voltageAboveThreshold: false,
    };
  }

  const state = inverterStates[inverterId];

  state.powerReadings.push({ timestamp: new Date(), power: power });

  const cutoffTime = new Date(
    Date.now() - (MIN_POWER_DURATION_MINUTES + 1) * 60 * 1000
  );
  state.powerReadings = state.powerReadings.filter(
    (p) => p.timestamp > cutoffTime
  );

  if (power < MIN_POWER_THRESHOLD) {
    state.lowPowerConsecutiveMinutes++;
  } else {
    state.lowPowerConsecutiveMinutes = 0;
  }

  if (
    state.lowPowerConsecutiveMinutes >= MIN_POWER_DURATION_MINUTES &&
    !state.isLowPowerAlertActive
  ) {
    createAlert(
      inverterId,
      "LOW_POWER",
      `Power dropped below ${MIN_POWER_THRESHOLD}W for ${state.lowPowerConsecutiveMinutes} consecutive minutes.`
    );
    state.isLowPowerAlertActive = true;
  } else if (
    state.lowPowerConsecutiveMinutes < MIN_POWER_DURATION_MINUTES &&
    state.isLowPowerAlertActive
  ) {
    console.log(`[ALERT CLEARED] Inverter: ${inverterId}, Type: LOW_POWER`);
    state.isLowPowerAlertActive = false;
  }

  if (voltage > MAX_VOLTAGE_THRESHOLD) {
    if (!state.voltageAboveThreshold) {
      createAlert(
        inverterId,
        "HIGH_VOLTAGE",
        `Voltage exceeded ${MAX_VOLTAGE_THRESHOLD}V (Current: ${voltage}V).`
      );
      state.voltageAboveThreshold = true;
    }
  } else {
    state.voltageAboveThreshold = false;
  }
}

app.get("/alerts/:inverterId", (req, res) => {
  const inverterId = req.params.inverterId;
  const inverterAlerts = alerts.filter(
    (alert) => alert.inverterId === inverterId
  );

  if (inverterAlerts.length > 0) {
    res.json(inverterAlerts);
  } else {
    res
      .status(404)
      .json({ message: `No alerts found for inverter ${inverterId}.` });
  }
});

let simulationInterval;
let simulationCounter = 0;

function simulateTelemetryStream() {
  const invertersToSimulate = ["inverter-101", "inverter-102", "inverter-103"];

  invertersToSimulate.forEach((inverterId) => {
    let power, voltage;

    if (inverterId === "inverter-101") {
      power = Math.random() * (200 - 50) + 50;
      voltage = Math.random() * (250 - 220) + 220;
    } else if (inverterId === "inverter-102") {
      if (simulationCounter > 10 && simulationCounter < 20) {
        power = Math.random() * (9 - 0.1) + 0.1;
        voltage = Math.random() * (250 - 220) + 220;
      } else {
        power = Math.random() * (200 - 50) + 50;
        voltage = Math.random() * (250 - 220) + 220;
      }
    } else if (inverterId === "inverter-103") {
      if (simulationCounter % 7 === 0 || simulationCounter % 13 === 0) {
        power = Math.random() * (200 - 50) + 50;
        voltage = Math.random() * (280 - 271) + 271;
      } else {
        power = Math.random() * (200 - 50) + 50;
        voltage = Math.random() * (250 - 220) + 220;
      }
    }

    const telemetryData = {
      inverterId: inverterId,
      power: parseFloat(power.toFixed(2)),
      voltage: parseFloat(voltage.toFixed(2)),
      timestamp: new Date().toISOString(),
    };

    console.log(
      `[SIMULATING] Inverter: ${telemetryData.inverterId}, Power: ${telemetryData.power}W, Voltage: ${telemetryData.voltage}V`
    );
    processIncomingTelemetry(telemetryData);
  });

  simulationCounter++;
}

console.log(`\nStarting telemetry simulation. Alerts will appear in the console.
You can query alerts via: http://localhost:${port}/alerts/inverter-102 (or inverter-101, inverter-103)
`);
simulationInterval = setInterval(simulateTelemetryStream, 1000);

setTimeout(() => {
  clearInterval(simulationInterval);
  console.log("\nTelemetry simulation ended after 60 seconds.");
  console.log("Final alerts generated:");
  console.log(JSON.stringify(alerts, null, 2));
}, 60 * 1000);

app.listen(port, () => {
  console.log(`Alert API listening at http://localhost:${port}`);
});
