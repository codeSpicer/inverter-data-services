# Inverter Data Services

This repository contains a collection of services for processing and managing telemetry data from solar inverters.

The project currently includes the following components:

- `dataAggregator.js`: A script that aggregates raw inverter data into hourly average power readings for each inverter.
- `energyCalculator/`: A service to calculate energy production.
- `alertService/`: A service for monitoring and sending alerts.
- `dbDesign/`: Contains the database schema (`schema.sql`) and an Entity-Relationship Diagram (`ERD_inverter_telemetry.pdf`) for storing inverter data.
