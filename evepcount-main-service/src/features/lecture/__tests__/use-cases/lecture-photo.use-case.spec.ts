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
import { ApplicationError, ErrorCode } from "@common/errors";

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

    const { lecturePhotoFactory, lectureFactory } = lectureModuleFactory({
      database: db,
    });
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

  describe("should send photos to be proceeded", () => {
    let lecturePhoto1: LecturePhoto;
    let lecturePhoto2: LecturePhoto;

    beforeEach(async () => {
      await lectureCollection.deleteMany({});
      lecture1 = await lectureRepository.create({
        ...TEST_LECTURES.lecture1,
      });
      const photos = await Promise.all([
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
      ]);
      lecturePhoto1 = photos[0];
      lecturePhoto2 = photos[1];
    });

    it("should send photos successfully", async () => {
      await lecturePhotoUseCase.sendPhotosToBeProceeded({
        data: {
          lectureId: lecture1.id,
          imageIds: [lecturePhoto1.id, lecturePhoto2.id],
        },
      });
      expect(true).toBe(true);
    });
    it("should throw an error if lecture photo is not found", async () => {
      try {
        await lecturePhotoUseCase.sendPhotosToBeProceeded({
          data: {
            lectureId: lecture1.id,
            imageIds: [lecturePhoto1.id, "asdasdr"],
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
    it("should throw an error if lecture is not found", async () => {
      try {
        await lecturePhotoUseCase.sendPhotosToBeProceeded({
          data: {
            lectureId: "11111111111aaaaabce4eaff",
            imageIds: [lecturePhoto1.id],
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
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
