import { Module } from "@nestjs/common";
import { LectureControllerV1 } from "./controllers/v1/lecture.controller";

@Module({
  controllers: [LectureControllerV1],
})
export class LectureModule {}
