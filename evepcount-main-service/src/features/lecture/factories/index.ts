import { myLectureFactory } from "./lecture.factory";
import { Db } from "mongodb";

export function lectureModuleFactory(database?: Db) {
  const lectureFactory = myLectureFactory(database);
  return {
    lectureFactory,
  };
}
