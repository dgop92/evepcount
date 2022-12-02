import { myLectureFactory } from "./lecture.factory";
import { Db } from "mongodb";
import { myLecturePhotoFactory } from "./lecture-photo.factory";
import { LecturePhotoUseCase } from "../use-cases/lecture-photo.use-case";
import { myPeopleCountingFactory } from "./people-counting.factory";
import { AmqpClient } from "@common/message-queue/amqp-client";

export type LectureModuleFactoryOptions = {
  database?: Db;
  amqpClient?: AmqpClient;
};

export function lectureModuleFactory(options?: LectureModuleFactoryOptions) {
  const lectureFactory = myLectureFactory(options?.database);
  const lecturePhotoFactory = myLecturePhotoFactory(options?.database);
  const peopleCountingFactory = myPeopleCountingFactory(options?.amqpClient);

  const lecturePhotoUseCase =
    lecturePhotoFactory.lecturePhotoUseCase as LecturePhotoUseCase;
  lecturePhotoUseCase.setDependencies(
    lectureFactory.lectureUseCase,
    peopleCountingFactory.peopleCountingPublisher
  );
  return {
    lectureFactory,
    lecturePhotoFactory,
    peopleCountingFactory,
  };
}
