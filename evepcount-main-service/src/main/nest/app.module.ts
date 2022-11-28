import { BasicModule } from "@features/basic/basic.module";
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, RouterModule } from "@nestjs/core";
import { AllExceptionsFilter } from "./general-exception-filter";
import { LoggerMiddleware } from "./logger-middleware";

@Module({
  imports: [
    BasicModule,
    RouterModule.register([
      {
        path: "basic",
        module: BasicModule,
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
}
