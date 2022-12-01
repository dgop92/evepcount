import { LecturePhoto } from "@features/lecture/entities/lecture-photo";
import {
  LecturePhotoCreateInput,
  LecturePhotoDeleteInput,
} from "@features/lecture/schema-types";

export interface ILecturePhotoUseCase {
  create(input: LecturePhotoCreateInput): Promise<LecturePhoto>;
  delete(input: LecturePhotoDeleteInput): Promise<void>;
  getManyBy(lectureId: string): Promise<LecturePhoto[]>;
}