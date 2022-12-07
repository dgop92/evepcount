import { AppLogger } from "@common/logging/logger";
import { LecturePhotoRepository } from "../infrastructure/mongo/repositories/lecture-photo.repository";
import { ILecturePhotoRepository } from "../definitions/lecture-photo.repository.definition";
import { ILecturePhotoUseCase } from "../definitions/lecture-photo.use-case.definition";
import { ILecturePhotoService } from "../definitions/lecture-photo.service.definition";
import { LecturePhotoUseCase } from "../use-cases/lecture-photo.use-case";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { LecturePhotoMockService } from "../infrastructure/image-service/lecture-photo.service.mock";
import { LecturePhotoService } from "../infrastructure/image-service/lecture-photo.service";
import { getLectureCollection } from "../infrastructure/mongo/models/lecture.document";
import { Db } from "mongodb";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let lecturePhotoRepository: ILecturePhotoRepository;
let lecturePhotoUseCase: ILecturePhotoUseCase;
let lecturePhotoService: ILecturePhotoService;

export const myLecturePhotoFactory = (database?: Db) => {
  myLogger.info("calling lectureFactory");

  if (database !== undefined && lecturePhotoRepository === undefined) {
    myLogger.info("creating lectureRepository");
    const lectureCollection = getLectureCollection(database);
    lecturePhotoRepository = new LecturePhotoRepository(lectureCollection);
    myLogger.info("lectureRepository created");
  }

  if (lecturePhotoService === undefined) {
    myLogger.info("creating lecturePhotoService");
    if (APP_ENV_VARS.isTest) {
      lecturePhotoService = new LecturePhotoMockService();
    } else {
      lecturePhotoService = new LecturePhotoService(
        APP_ENV_VARS.cloudinary.baseFolder
      );
    }
    myLogger.info("lecturePhotoService created");
  }

  if (lecturePhotoUseCase === undefined) {
    myLogger.info("creating lectureUseCase");
    lecturePhotoUseCase = new LecturePhotoUseCase(
      lecturePhotoRepository,
      lecturePhotoService
    );
    myLogger.info("lectureUseCase created");
  }

  return {
    lecturePhotoRepository,
    lecturePhotoUseCase,
  };
};
