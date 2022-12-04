import { LectureModule } from "@features/lecture/infrastructure/nest/lecture.module";
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, RouterModule } from "@nestjs/core";
import { closeAmqpClient } from "main/amqp-factory";
import { closeMongoConnection } from "../mongo-client";
import { AllExceptionsFilter } from "./general-exception-filter";
import { LoggerMiddleware } from "./logger-middleware";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

@Module({
  imports: [
    LectureModule,
    RouterModule.register([
      {
        path: "lecture",
        module: LectureModule,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }

  onModuleDestroy() {
    myLogger.info("closing mongo connection");
    closeMongoConnection();
    myLogger.info("closing amqp connection");
    closeAmqpClient();
  }
}
