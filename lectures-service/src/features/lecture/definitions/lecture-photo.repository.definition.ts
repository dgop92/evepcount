import { LecturePhoto } from "@features/lecture/entities/lecture-photo";
import { LecturePhotoCreateInput } from "@features/lecture/schema-types";
import { Lecture } from "../entities/lecture";
import { PeopleCountingItem } from "../entities/people-counting-result";

export type LecturePhotoCreateRepoData = Pick<
  LecturePhotoCreateInput["data"],
  "lectureId"
> & {
  imageId: string;
  url: string;
};

export interface ILecturePhotoRepository {
  create(input: LecturePhotoCreateRepoData): Promise<LecturePhoto>;
  delete(lecture: Lecture, lecturePhoto: LecturePhoto): Promise<void>;
  getManyBy(lectureId: string): Promise<LecturePhoto[]>;
  addPeopleCounting(
    lecture: Lecture,
    peopleCountingItems: PeopleCountingItem[]
  ): Promise<PeopleCountingItem[]>;
}
