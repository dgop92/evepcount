import { AppLogger } from "@common/logging/logger";
import { ILectureRepository } from "../definitions/lecture.repository.definition";
import { LectureRepository } from "../infrastructure/mongo/repositories/lecture.repository";
import { ILectureUseCase } from "../definitions/lecture.use-case.definition";
import { LectureUseCase } from "../use-cases/lecture.use-case";
import { Db } from "mongodb";
import { getLectureCollection } from "../infrastructure/mongo/models/lecture.document";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let lectureRepository: ILectureRepository;
let lectureUseCase: ILectureUseCase;

export const myLectureFactory = (database?: Db) => {
  myLogger.info("calling lectureFactory");

  if (database !== undefined && lectureRepository === undefined) {
    myLogger.info("creating lectureRepository");
    const lectureCollection = getLectureCollection(database);
    lectureRepository = new LectureRepository(lectureCollection);
    myLogger.info("lectureRepository created");
  }

  if (lectureUseCase === undefined) {
    myLogger.info("creating lectureUseCase");
    lectureUseCase = new LectureUseCase(lectureRepository);
    myLogger.info("lectureUseCase created");
  }

  return {
    lectureRepository,
    lectureUseCase,
  };
};
