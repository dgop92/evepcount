import { AppLogger } from "@common/logging/logger";
import { Lecture } from "@features/lecture/entities/lecture";
import { LectureDocument } from "../models/lecture.document";
import { Collection, ObjectId } from "mongodb";
import {
  ILecturePhotoRepository,
  LecturePhotoCreateRepoData,
} from "@features/lecture/definitions/lecture-photo.repository.definition";
import { LecturePhoto } from "@features/lecture/entities/lecture-photo";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class LecturePhotoRepository implements ILecturePhotoRepository {
  constructor(private readonly collection: Collection<LectureDocument>) {}

  async create(input: LecturePhotoCreateRepoData): Promise<LecturePhoto> {
    myLogger.debug("adding photo to lecture", { input });
    const lecturePhoto = {
      id: input.imageId,
      url: input.url,
    };
    await this.collection.updateOne(
      { _id: new ObjectId(input.lectureId) },
      { $push: { photos: lecturePhoto } }
    );
    myLogger.debug("photo added to lecture", { input });
    return lecturePhoto;
  }

  async delete(lecture: Lecture, lecturePhoto: LecturePhoto): Promise<void> {
    myLogger.debug("deleting photo from lecture", {
      id: lecture.id,
      lecturePhoto,
    });
    await this.collection.updateOne(
      { _id: new ObjectId(lecture.id) },
      { $pull: { photos: { id: lecturePhoto.id } } }
    );
    myLogger.debug("photo deleted from lecture", {
      id: lecture.id,
      lecturePhoto,
    });
  }

  async getManyBy(lectureId: string): Promise<LecturePhoto[]> {
    const document = await this.collection.findOne(
      { _id: new ObjectId(lectureId) },
      { projection: { photos: 1 } }
    );
    const photos = document?.photos ?? [];
    return photos;
  }
}
