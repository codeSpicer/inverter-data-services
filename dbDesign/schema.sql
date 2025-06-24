CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(64) UNIQUE NOT NULL,
  `password_hash` text NOT NULL,
  `email` varchar(128) UNIQUE
);

CREATE TABLE `inverters` (
  `inverter_id` varchar(64) PRIMARY KEY,
  `name` varchar(128) NOT NULL,
  `location` varchar(255),
  `user_id` integer NOT NULL
);

CREATE TABLE `telemetry_data` (
  `timestamp` timestamp,
  `inverter_id` varchar(64),
  `current_power_output_kw` real,
  `daily_energy_kwh` real,
  `lifetime_energy_kwh` real,
  `inverter_temperature_c` real,
  PRIMARY KEY (`timestamp`, `inverter_id`)
);

CREATE TABLE `alerts` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `inverter_id` varchar(64) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT (now()),
  `alert_type` varchar(64) NOT NULL,
  `message` text NOT NULL,
  `is_resolved` boolean NOT NULL DEFAULT false
);

CREATE TABLE `user_inverter_access` (
  `user_id` integer,
  `inverter_id` varchar(64),
  `access_level` varchar(32) NOT NULL DEFAULT 'read_only',
  `granted_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`user_id`, `inverter_id`)
);

ALTER TABLE `inverters` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `telemetry_data` ADD FOREIGN KEY (`inverter_id`) REFERENCES `inverters` (`inverter_id`);

ALTER TABLE `alerts` ADD FOREIGN KEY (`inverter_id`) REFERENCES `inverters` (`inverter_id`);

ALTER TABLE `user_inverter_access` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `user_inverter_access` ADD FOREIGN KEY (`inverter_id`) REFERENCES `inverters` (`inverter_id`);
