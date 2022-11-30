import { myLectureFactory } from "@features/lecture/factories/lecture.factory";
import { Db } from "mongodb";

export function setupFactories(database?: Db) {
  myLectureFactory(database);
}
