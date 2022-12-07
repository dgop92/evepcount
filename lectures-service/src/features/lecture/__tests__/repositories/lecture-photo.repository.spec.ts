import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { Lecture } from "@features/lecture/entities/lecture";
import { LectureRepository } from "@features/lecture/infrastructure/mongo/repositories/lecture.repository";
import { TEST_LECTURES, TEST_LECTURE_PHOTOS } from "../mocks/test-data";
import { Collection } from "mongodb";
import {
  closeMongoConnection,
  getMongoTestDatabase,
} from "test/test-mongo-client";
import {
  getLectureCollection,
  LectureDocument,
} from "@features/lecture/infrastructure/mongo/models/lecture.document";
import { LecturePhotoRepository } from "@features/lecture/infrastructure/mongo/repositories/lecture-photo.repository";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("lecture repository", () => {
  let lectureRepository: LectureRepository;

  let lecturePhotoRepository: LecturePhotoRepository;
  let lectureCollection: Collection<LectureDocument>;

  beforeAll(async () => {
    const mongoData = getMongoTestDatabase();
    lectureCollection = getLectureCollection(mongoData.mongoDatabase);
    lectureRepository = new LectureRepository(lectureCollection);
    lecturePhotoRepository = new LecturePhotoRepository(lectureCollection);
  });

  afterAll(async () => {
    closeMongoConnection();
  });

  describe("Create", () => {
    let lecture1: Lecture;

    beforeEach(async () => {
      await lectureCollection.deleteMany({});
      lecture1 = await lectureRepository.create(TEST_LECTURES.lecture1);
    });

    it("should add a photo to lecture", async () => {
      await lecturePhotoRepository.create({
        lectureId: lecture1.id,
        ...TEST_LECTURE_PHOTOS.lecturePhoto1,
      });

      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
        options: { fetchPhotos: true },
      });
      const photo = lectureRetrieved?.photos?.[0];
      expect(photo?.id).toBe(TEST_LECTURE_PHOTOS.lecturePhoto1.imageId);
      expect(photo?.url).toBe(TEST_LECTURE_PHOTOS.lecturePhoto1.url);
    });
  });

  describe("Delete", () => {
    let lecture1: Lecture;

    beforeEach(async () => {
      await lectureCollection.deleteMany({});
      lecture1 = await lectureRepository.create(TEST_LECTURES.lecture1);
      await lecturePhotoRepository.create({
        lectureId: lecture1.id,
        ...TEST_LECTURE_PHOTOS.lecturePhoto1,
      });
    });

    it("should delete a photo from lecture", async () => {
      await lecturePhotoRepository.delete(lecture1, {
        id: TEST_LECTURE_PHOTOS.lecturePhoto1.imageId,
        url: TEST_LECTURE_PHOTOS.lecturePhoto1.url,
      });
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
        options: { fetchPhotos: true },
      });
      expect(lectureRetrieved?.photos?.length).toBe(0);
    });
  });

  describe("Get many by", () => {
    let lecture1: Lecture;

    beforeAll(async () => {
      await lectureCollection.deleteMany({});
      lecture1 = await lectureRepository.create(TEST_LECTURES.lecture1);

      await Promise.all([
        await lecturePhotoRepository.create({
          lectureId: lecture1.id,
          ...TEST_LECTURE_PHOTOS.lecturePhoto1,
        }),
        await lecturePhotoRepository.create({
          lectureId: lecture1.id,
          ...TEST_LECTURE_PHOTOS.lecturePhoto2,
        }),
      ]);
    });

    it("should get all of photos from lecture", async () => {
      const photos = await lecturePhotoRepository.getManyBy(lecture1.id);
      expect(photos.length).toBe(2);
    });
  });
});
