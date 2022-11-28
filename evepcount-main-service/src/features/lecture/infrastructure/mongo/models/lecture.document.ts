import { Lecture } from "@features/lecture/entities/lecture";

export type LectureDocument = Omit<Lecture, "id">;
