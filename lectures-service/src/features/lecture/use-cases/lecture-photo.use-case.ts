import { ApplicationError, ErrorCode } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import Joi from "joi";
import {
  LecturePhoto,
  LecturePhotoCreateInputSchema,
  LecturePhotoDeleteInputSchema,
} from "../entities/lecture-photo";
import { ILecturePhotoRepository } from "../definitions/lecture-photo.repository.definition";
import { ILecturePhotoService } from "../definitions/lecture-photo.service.definition";
import { ILecturePhotoUseCase } from "../definitions/lecture-photo.use-case.definition";
import {
  LecturePhotoCreateInput,
  LecturePhotoDeleteInput,
  PeopleCountingMessageCreateInput,
  PeopleCountingResultInput,
} from "../schema-types";
import { ILectureUseCase } from "../definitions/lecture.use-case.definition";
import { IPeopleCountingPublisher } from "../definitions/people-counting-publisher.definition";
import {
  PeopleCountingResultInputSchema,
  PeopleCountingItem,
} from "../entities/people-counting-result";
import { PeopleCountingMessageCreateInputSchema } from "../entities/people-counting-message";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class LecturePhotoUseCase implements ILecturePhotoUseCase {
  private lectureUseCase: ILectureUseCase;
  private peopleCountingPublisher: IPeopleCountingPublisher;

  constructor(
    private readonly repository: ILecturePhotoRepository,
    private readonly photoService: ILecturePhotoService
  ) {}

  setDependencies(
    lectureUseCase: ILectureUseCase,
    peopleCountingPublisher: IPeopleCountingPublisher
  ): void {
    this.lectureUseCase = lectureUseCase;
    this.peopleCountingPublisher = peopleCountingPublisher;
  }

  // Note: if the linking to the lecture fails, the image will be orphaned in the image store service. Consider using a cron job to clean up orphaned images.
  async create(input: LecturePhotoCreateInput): Promise<LecturePhoto> {
    this.validateInput(LecturePhotoCreateInputSchema, input);

    const existing = await this.lectureUseCase.getOneBy({
      searchBy: { id: input.data.lectureId },
    });

    if (!existing) {
      throw new ApplicationError("lecture not found", ErrorCode.NOT_FOUND);
    }

    myLogger.debug("saving image to image store service");
    const photo = await this.photoService.saveAsBase64(input.data.image);
    myLogger.debug("linking image to lecture in db");
    const lecturePhoto = await this.repository.create({
      lectureId: input.data.lectureId,
      imageId: photo.id,
      url: photo.url,
    });
    return lecturePhoto;
  }

  async delete(input: LecturePhotoDeleteInput): Promise<void> {
    this.validateInput(LecturePhotoDeleteInputSchema, input);

    const lectureId = input.searchBy.lectureId;
    myLogger.debug("getting lecture", {
      lectureId,
    });
    const lecture = await this.lectureUseCase.getOneBy({
      searchBy: { id: lectureId },
      options: { fetchPhotos: true },
    });
    if (!lecture) {
      throw new ApplicationError("lecture not found", ErrorCode.NOT_FOUND);
    }

    const imageId = input.searchBy.imageId;
    myLogger.debug("getting lecture photo", {
      lectureId,
      imageId,
    });
    const lecturePhoto = lecture.photos!.find((p) => p.id === imageId);
    if (!lecturePhoto) {
      throw new ApplicationError(
        "lecture photo not found",
        ErrorCode.NOT_FOUND
      );
    }

    myLogger.debug("deleting lecture photo from db");
    await this.repository.delete(lecture, lecturePhoto);
    myLogger.debug("lecture photo deleted");

    myLogger.debug("deleting image from image store service");
    await this.photoService.delete(imageId);
    myLogger.debug("image deleted from image store service");
  }

  getManyBy(lectureId: string): Promise<LecturePhoto[]> {
    return this.repository.getManyBy(lectureId);
  }

  async sendPhotosToBeProceeded(
    input: PeopleCountingMessageCreateInput
  ): Promise<void> {
    this.validateInput(PeopleCountingMessageCreateInputSchema, input);
    const lectureId = input.data.lectureId;
    myLogger.debug("getting lecture", {
      lectureId,
    });
    const lecture = await this.lectureUseCase.getOneBy({
      searchBy: { id: lectureId },
      options: { fetchPhotos: true },
    });
    if (!lecture) {
      throw new ApplicationError("lecture not found", ErrorCode.NOT_FOUND);
    }

    const imageIds = input.data.imageIds;
    const lecturePhotos = lecture.photos!;

    const photosToBeProcessed: LecturePhoto[] = [];
    imageIds.forEach((imageId) => {
      const lecturePhoto = lecturePhotos.find((p) => p.id === imageId);
      if (!lecturePhoto) {
        throw new ApplicationError(
          "lecture photo not found",
          ErrorCode.NOT_FOUND
        );
      }
      photosToBeProcessed.push(lecturePhoto);
    });

    await this.peopleCountingPublisher.publish({
      lectureId,
      photos: photosToBeProcessed,
    });
  }

  async addPeopleCountingResults(
    input: PeopleCountingResultInput
  ): Promise<PeopleCountingItem[]> {
    this.validateInput(PeopleCountingResultInputSchema, input);

    const lectureId = input.data.lectureId;
    myLogger.debug("getting lecture", {
      lectureId,
    });
    const lecture = await this.lectureUseCase.getOneBy({
      searchBy: { id: lectureId },
      options: { fetchPhotos: true, fetchPeopleCountingItems: true },
    });
    if (!lecture) {
      throw new ApplicationError("lecture not found", ErrorCode.NOT_FOUND);
    }
    const lecturePhotoImageIds = lecture.photos!.map((p) => p.id);
    const inputPeopleCountingItemsImageIds = input.data.peopleCountingItems.map(
      (p) => p.imageId
    );
    const imageIdsNotBelongingToLecture =
      inputPeopleCountingItemsImageIds.filter(
        (imageId) => !lecturePhotoImageIds.includes(imageId)
      );

    if (imageIdsNotBelongingToLecture.length > 0) {
      throw new ApplicationError(
        `the following image ids do not belong to the lecture: ${imageIdsNotBelongingToLecture.join(
          ", "
        )}`,
        ErrorCode.INVALID_OPERATION
      );
    }

    const lecturePeopleCountingItemImageIds = lecture.peopleCountingItems!.map(
      (p) => p.imageId
    );
    const peopleCountingItemsToBeAdded = input.data.peopleCountingItems.filter(
      (p) => !lecturePeopleCountingItemImageIds.includes(p.imageId)
    );

    const peopleCountingItemsToBeUpdated: {
      oldPeopleCountingItem: PeopleCountingItem;
      newPeopleCountingItem: PeopleCountingItem;
    }[] = [];

    input.data.peopleCountingItems.forEach((newPeopleCountingItem) => {
      const oldPeopleCountingItem = lecture.peopleCountingItems!.find(
        (p) => p.imageId === newPeopleCountingItem.imageId
      );
      if (oldPeopleCountingItem) {
        peopleCountingItemsToBeUpdated.push({
          oldPeopleCountingItem,
          newPeopleCountingItem,
        });
      }
    });

    const peopleCountingItemsAdded =
      await this.repository.addPeopleCountingResult(
        lecture,
        peopleCountingItemsToBeAdded
      );
    const peopleCountingItemsUpdated = await Promise.all(
      peopleCountingItemsToBeUpdated.map((pcu) =>
        this.repository.updatePeopleCountingItem(
          lecture,
          pcu.oldPeopleCountingItem,
          pcu.newPeopleCountingItem
        )
      )
    );
    return [...peopleCountingItemsAdded, ...peopleCountingItemsUpdated];
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
