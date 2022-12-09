import { LecturePhoto } from "@features/lecture/entities/lecture-photo";
import {
  LecturePhotoCreateInput,
  LecturePhotoDeleteInput,
  PeopleCountingMessageCreateInput,
  PeopleCountingResultInput,
} from "@features/lecture/schema-types";
import { PeopleCountingItem } from "../entities/people-counting-result";

export interface ILecturePhotoUseCase {
  create(input: LecturePhotoCreateInput): Promise<LecturePhoto>;
  delete(input: LecturePhotoDeleteInput): Promise<void>;
  getManyBy(lectureId: string): Promise<LecturePhoto[]>;
  sendPhotosToBeProceeded(
    input: PeopleCountingMessageCreateInput
  ): Promise<void>;
  addPeopleCounting(
    input: PeopleCountingResultInput
  ): Promise<PeopleCountingItem[]>;
}
