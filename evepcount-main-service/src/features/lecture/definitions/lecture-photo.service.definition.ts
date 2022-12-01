import { LecturePhoto } from "@features/lecture/entities/lecture-photo";

export type LecturePhotoSimplified = Pick<LecturePhoto, "id" | "url">;

export interface ILecturePhotoService {
  saveAsBase64(base64image: string): Promise<LecturePhotoSimplified>;
  delete(imageId: string): Promise<void>;
}
