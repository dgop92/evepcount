import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { Lecture } from "@features/lecture/entities/lecture";
import { LecturePhoto } from "@features/lecture/entities/lecture-photo";
import { ILecturePhotoUseCase } from "@features/lecture/definitions/lecture-photo.use-case.definition";
import { ILectureRepository } from "@features/lecture/definitions/lecture.repository.definition";
import {
  closeMongoConnection,
  getMongoTestDatabase,
} from "test/test-mongo-client";
import { TEST_LECTURES } from "../mocks/test-data";
import {
  getLectureCollection,
  LectureDocument,
} from "@features/lecture/infrastructure/mongo/models/lecture.document";
import { Collection } from "mongodb";
import { lectureModuleFactory } from "@features/lecture/factories";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("lecture-photo use-case", () => {
  let lectureRepository: ILectureRepository;
  let lecturePhotoUseCase: ILecturePhotoUseCase;
  let lectureCollection: Collection<LectureDocument>;

  let lecture1: Lecture;

  beforeAll(async () => {
    const mongoData = getMongoTestDatabase();
    const db = mongoData.mongoDatabase;

    const { lecturePhotoFactory, lectureFactory } = lectureModuleFactory(db);
    lecturePhotoUseCase = lecturePhotoFactory.lecturePhotoUseCase;
    lectureRepository = lectureFactory.lectureRepository;

    lectureCollection = getLectureCollection(mongoData.mongoDatabase);
  });

  afterAll(async () => {
    closeMongoConnection();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await lectureCollection.deleteMany({});
      lecture1 = await lectureRepository.create({
        ...TEST_LECTURES.lecture1,
      });
    });

    it("should create a lecture-photo", async () => {
      const lecturePhoto = await lecturePhotoUseCase.create({
        data: { image: "dummy_image", lectureId: lecture1.id },
      });
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
        options: { fetchPhotos: true },
      });
      expect(lectureRetrieved?.photos?.length).toBe(1);
      expect(lectureRetrieved?.photos?.[0]).toMatchObject(lecturePhoto);
    });
  });

  describe("Delete", () => {
    let lecturePhoto1: LecturePhoto;

    beforeEach(async () => {
      await lectureCollection.deleteMany({});
      lecture1 = await lectureRepository.create({
        ...TEST_LECTURES.lecture1,
      });
      lecturePhoto1 = await lecturePhotoUseCase.create({
        data: { image: "dummy_image", lectureId: lecture1.id },
      });
    });

    it("should delete a lecture-photo", async () => {
      await lecturePhotoUseCase.delete({
        searchBy: { imageId: lecturePhoto1.id, lectureId: lecture1.id },
      });
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
        options: { fetchPhotos: true },
      });
      expect(lectureRetrieved?.photos?.length).toBe(0);
    });
  });

  describe("Get many by", () => {
    let lecture2: Lecture;

    beforeAll(async () => {
      await lectureCollection.deleteMany({});
      lecture1 = await lectureRepository.create({
        ...TEST_LECTURES.lecture1,
      });
      lecture2 = await lectureRepository.create({
        ...TEST_LECTURES.lecture2,
      });
      await Promise.all([
        lecturePhotoUseCase.create({
          data: {
            image: "dummy_image",
            lectureId: lecture1.id,
          },
        }),
        lecturePhotoUseCase.create({
          data: {
            image: "dummy_image",
            lectureId: lecture1.id,
          },
        }),
        lecturePhotoUseCase.create({
          data: {
            image: "dummy_image",
            lectureId: lecture2.id,
          },
        }),
      ]);
    });

    it("should get all lecture photos by lecture id", async () => {
      let lecturePhotosRetrieved = await lecturePhotoUseCase.getManyBy(
        lecture1.id
      );
      expect(lecturePhotosRetrieved).toHaveLength(2);
      lecturePhotosRetrieved = await lecturePhotoUseCase.getManyBy(lecture2.id);
      expect(lecturePhotosRetrieved).toHaveLength(1);
    });
  });
});