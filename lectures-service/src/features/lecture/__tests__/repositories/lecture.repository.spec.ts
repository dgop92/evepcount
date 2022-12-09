import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { Lecture } from "@features/lecture/entities/lecture";
import { LectureRepository } from "@features/lecture/infrastructure/mongo/repositories/lecture.repository";
import { TEST_LECTURES } from "../mocks/test-data";
import { Collection } from "mongodb";
import {
  closeMongoConnection,
  getMongoTestDatabase,
} from "test/test-mongo-client";
import {
  getLectureCollection,
  LectureDocument,
} from "@features/lecture/infrastructure/mongo/models/lecture.document";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("lecture repository", () => {
  let lectureRepository: LectureRepository;
  let lectureCollection: Collection<LectureDocument>;

  beforeAll(async () => {
    const mongoData = getMongoTestDatabase();
    lectureCollection = getLectureCollection(mongoData.mongoDatabase);
    lectureRepository = new LectureRepository(lectureCollection);
  });

  afterAll(async () => {
    closeMongoConnection();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await lectureCollection.deleteMany({});
    });

    it("should create a lecture", async () => {
      const inputData = TEST_LECTURES.lecture1;
      const lecture = await lectureRepository.create(inputData);
      expect(lecture).toMatchObject(inputData);

      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture.id },
      });
      expect(lectureRetrieved).toBeDefined();
    });
  });

  describe("Update", () => {
    let lecture1: Lecture;

    beforeEach(async () => {
      await lectureCollection.deleteMany({});
      lecture1 = await lectureRepository.create(TEST_LECTURES.lecture1);
    });

    it("should update a lecture", async () => {
      const inputData = {
        title: "test lecture updated",
      };
      const lecture = await lectureRepository.update(lecture1, inputData);
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture.id },
      });
      expect(lectureRetrieved).toMatchObject({
        ...inputData,
        id: lecture.id,
      });
    });
  });

  describe("Delete", () => {
    let lecture1: Lecture;

    beforeEach(async () => {
      await lectureCollection.deleteMany({});
      lecture1 = await lectureRepository.create(TEST_LECTURES.lecture1);
    });

    it("should delete a lecture", async () => {
      await lectureRepository.delete(lecture1);
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
      });
      expect(lectureRetrieved).toBeUndefined();
    });
  });

  describe("Get one by", () => {
    let lecture1: Lecture;

    beforeAll(async () => {
      await lectureCollection.deleteMany({});
      lecture1 = await lectureRepository.create(TEST_LECTURES.lecture1);
      await lectureRepository.create(TEST_LECTURES.lecture3);
    });

    it("should get a lecture by id", async () => {
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
      });
      expect(lectureRetrieved).toBeDefined();
      expect(lectureRetrieved).toMatchObject(TEST_LECTURES.lecture1);
    });
    it("should get a lecture by id and fetch photos", async () => {
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
        options: { fetchPhotos: true },
      });
      expect(lectureRetrieved?.photos).toBeDefined();
      expect(lectureRetrieved?.photos).toHaveLength(0);
      expect(lectureRetrieved).toMatchObject(TEST_LECTURES.lecture1);
    });
    it("should get a lecture by id and fetch people counting items", async () => {
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
        options: { fetchPeopleCountingItems: true },
      });
      expect(lectureRetrieved?.peopleCountingItems).toBeDefined();
      expect(lectureRetrieved?.peopleCountingItems).toHaveLength(0);
      expect(lectureRetrieved).toMatchObject(TEST_LECTURES.lecture1);
    });
    it("should get a lecture by title", async () => {
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { title: "diff" },
      });
      expect(lectureRetrieved).toBeDefined();
      expect(lectureRetrieved).toMatchObject(TEST_LECTURES.lecture3);
    });
    it("should not get a lecture by id", async () => {
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: "11111111111aaaaabce4eaff" },
      });
      expect(lectureRetrieved).toBeUndefined();
    });
    it("should not get a lecture by title", async () => {
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { title: "asdasdnmaueygasd" },
      });
      expect(lectureRetrieved).toBeUndefined();
    });
  });

  describe("Get many by", () => {
    beforeAll(async () => {
      await lectureCollection.deleteMany({});
      await Promise.all([
        lectureRepository.create(TEST_LECTURES.lecture1),
        lectureRepository.create(TEST_LECTURES.lecture2),
        lectureRepository.create(TEST_LECTURES.lecture3),
      ]);
    });

    it("should get all lectures", async () => {
      const lectures = await lectureRepository.getManyBy({});
      expect(lectures.results).toHaveLength(3);
      expect(lectures.count).toBe(3);
    });
    it("should get all lectures and fetch photos", async () => {
      const lectures = await lectureRepository.getManyBy({
        options: { fetchPhotos: true },
      });
      expect(lectures.results).toHaveLength(3);
      expect(lectures.results.map((l) => l.photos?.length)).toEqual([0, 0, 0]);
      expect(lectures.count).toBe(3);
    });
    it("should get all lectures and fetch people counting items", async () => {
      const lectures = await lectureRepository.getManyBy({
        options: { fetchPeopleCountingItems: true },
      });
      expect(lectures.results).toHaveLength(3);
      expect(
        lectures.results.map((l) => l.peopleCountingItems?.length)
      ).toEqual([0, 0, 0]);
      expect(lectures.count).toBe(3);
    });
    it("should get all lectures with title test", async () => {
      const lectures = await lectureRepository.getManyBy({
        searchBy: { title: "test" },
      });
      expect(lectures.count).toBe(2);
    });
  });
});
