import { myLectureFactory } from "./lecture.factory";
import { Db } from "mongodb";
import { myLecturePhotoFactory } from "./lecture-photo.factory";
import { LecturePhotoUseCase } from "../use-cases/lecture-photo.use-case";
import { myPeopleCountingFactory } from "./people-counting.factory";

export function lectureModuleFactory(database?: Db) {
  const lectureFactory = myLectureFactory(database);
  const lecturePhotoFactory = myLecturePhotoFactory(database);
  const peopleCountingFactory = myPeopleCountingFactory();

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
