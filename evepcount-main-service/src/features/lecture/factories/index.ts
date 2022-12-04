import { myLectureFactory } from "./lecture.factory";
import { Db } from "mongodb";
import { myLecturePhotoFactory } from "./lecture-photo.factory";
import { LecturePhotoUseCase } from "../use-cases/lecture-photo.use-case";
import { myPeopleCountingFactory } from "./people-counting.factory";
import { MessageQueueClient } from "@common/message-queue/message-queue.client";

export type LectureModuleFactoryOptions = {
  database: Db;
  messageQueueClient: MessageQueueClient;
};

export function lectureModuleFactory(options: LectureModuleFactoryOptions) {
  const lectureFactory = myLectureFactory(options.database);
  const lecturePhotoFactory = myLecturePhotoFactory(options.database);
  const peopleCountingFactory = myPeopleCountingFactory(
    options.messageQueueClient
  );

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
