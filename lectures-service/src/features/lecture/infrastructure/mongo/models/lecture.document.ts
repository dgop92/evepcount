import { Lecture } from "@features/lecture/entities/lecture";
import { Db } from "mongodb";

export type LectureDocument = Omit<Lecture, "id">;

export function getLectureCollection(database: Db) {
  return database.collection<LectureDocument>("lectures");
}
