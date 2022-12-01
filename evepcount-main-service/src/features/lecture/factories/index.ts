import { myLectureFactory } from "./lecture.factory";
import { Db } from "mongodb";
import { myLecturePhotoFactory } from "./lecture-photo.factory";
import { LecturePhotoUseCase } from "../use-cases/lecture-photo.use-case";

export function lectureModuleFactory(database?: Db) {
  const lectureFactory = myLectureFactory(database);
  const lecturePhotoFactory = myLecturePhotoFactory(database);
  const lecturePhotoUseCase =
    lecturePhotoFactory.lecturePhotoUseCase as LecturePhotoUseCase;
  lecturePhotoUseCase.setDependencies(lectureFactory.lectureUseCase);
  return {
    lectureFactory,
    lecturePhotoFactory,
  };
}
