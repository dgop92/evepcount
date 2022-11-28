import { Module } from "@nestjs/common";
import { BasicControllerV1 } from "./controllers/v1/basic.controller";

@Module({
  controllers: [BasicControllerV1],
})
export class BasicModule {}
