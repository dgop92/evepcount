import {
  getOsEnv,
  getOsEnvOrDefault,
  parseIntOrThrow,
  parseListOrDefault,
} from "./env-utils";

export const APP_ENV_VARS = {
  NODE_ENV: getOsEnv("NODE_ENV"),
  isProduction: getOsEnv("NODE_ENV") === "prod",
  isTest: getOsEnv("NODE_ENV") === "test",
  port: parseIntOrThrow(process.env.PORT || getOsEnv("APP_PORT")),
  logging: {
    level: getOsEnvOrDefault("LOG_LEVEL", "info"),
  },
  cloudinary: {
    baseFolder: `${getOsEnv("CLOUDINARY_BASE_FOLDER")}/${getOsEnv("NODE_ENV")}`,
  },
  db: {
    mongoUrl: getOsEnv("MONGO_URL"),
    databaseName: getOsEnv("MONGO_DB_NAME"),
  },
  rabbitmq: {
    url: getOsEnv("RABBITMQ_URL"),
    timeout: parseIntOrThrow(getOsEnvOrDefault("RABBITMQ_TIMEOUT", "5000")),
  },
  cors: {
    allowOrigins: parseListOrDefault(
      getOsEnvOrDefault("CORS_ALLOW_ORIGINS", ""),
      "*"
    ),
  },
};
