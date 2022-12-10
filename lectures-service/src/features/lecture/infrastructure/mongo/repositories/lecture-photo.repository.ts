import { AppLogger } from "@common/logging/logger";
import { Lecture } from "@features/lecture/entities/lecture";
import { LectureDocument } from "../models/lecture.document";
import { Collection, ObjectId } from "mongodb";
import {
  ILecturePhotoRepository,
  LecturePhotoCreateRepoData,
} from "@features/lecture/definitions/lecture-photo.repository.definition";
import { LecturePhoto } from "@features/lecture/entities/lecture-photo";
import { PeopleCountingItem } from "@features/lecture/entities/people-counting-result";

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
    await this.collection.updateOne(
      { _id: new ObjectId(lecture.id) },
      { $pull: { peopleCountingItems: { imageId: lecturePhoto.id } } }
    );
    myLogger.debug("photo deleted from lecture", {
      id: lecture.id,
      lecturePhoto,
    });
  }

  async addPeopleCountingResult(
    lecture: Lecture,
    peopleCountingItems: PeopleCountingItem[]
  ): Promise<PeopleCountingItem[]> {
    myLogger.debug("adding people counting items to photo", {
      id: lecture.id,
      peopleCountingItems: peopleCountingItems,
    });
    await this.collection.updateOne(
      { _id: new ObjectId(lecture.id) },
      { $addToSet: { peopleCountingItems: { $each: peopleCountingItems } } }
    );
    myLogger.debug("people counting added to photo", {
      id: lecture.id,
      peopleCountingItems: peopleCountingItems,
    });
    return peopleCountingItems;
  }

  async updatePeopleCountingItem(
    lecture: Lecture,
    peopleCountingItem: PeopleCountingItem,
    newPeopleCountingItem: PeopleCountingItem
  ): Promise<PeopleCountingItem> {
    myLogger.debug("updating people counting item", {
      id: lecture.id,
      peopleCountingItem,
    });
    await this.collection.updateOne(
      {
        _id: new ObjectId(lecture.id),
        "peopleCountingItems.imageId": peopleCountingItem.imageId,
      },
      {
        $set: {
          "peopleCountingItems.$": newPeopleCountingItem,
        },
      }
    );
    myLogger.debug("people counting item updated", {
      id: lecture.id,
      newPeopleCountingItem,
    });
    return newPeopleCountingItem;
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
