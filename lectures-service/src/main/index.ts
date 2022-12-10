import "reflect-metadata";
import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { AppModule } from "./nest/app.module";
import { AllExceptionsFilter } from "./nest/general-exception-filter";
import { setupFactories } from "./setup-factories";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { closeMongoConnection, getMongoDatabase } from "./mongo-client";
import { closeAmqpClient, messageQueueClientFactory } from "./amqp-factory";

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

async function startApp() {
  const { mongoDatabase } = await getMongoDatabase();
  const { messageQueueClient } = await messageQueueClientFactory();

  setupFactories(mongoDatabase, messageQueueClient);

  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  app.enableCors({
    origin: APP_ENV_VARS.cors.allowOrigins,
  });
  await app.listen(APP_ENV_VARS.port);
}

function closeServices() {
  try {
    myLogger.info("closing mongo connection");
    closeMongoConnection();
    myLogger.info("closing amqp connection");
    closeAmqpClient();
  } catch (error) {
    myLogger.error("error closing services", { error });
  }
}

process.on("unhandledRejection", (reason, promise) => {
  myLogger.error("unhandled rejection, node process will finish", {
    reason,
    promise,
  });
  process.exitCode = 1;
});

process.on("uncaughtException", (err) => {
  myLogger.error("uncaught exception, node process will finish", { err });
  process.exitCode = 1;
});

process.on("SIGINT", function () {
  process.exit(2);
});

process.on("exit", function () {
  // NOTE: this will be called when the node process finishes,
  // either because of an error or because of a normal exit
  myLogger.info("node process will exit, cleaning up services");
  closeServices();
});

startApp()
  .then(() => {
    myLogger.info("app started successfully");
  })
  .catch((err) => {
    // NOTE: errors thrown by startApp() will be caught here,
    // we can call them boot errors
    myLogger.error("app failed to start, node process will finish", { err });
    process.exitCode = 1;
  });
