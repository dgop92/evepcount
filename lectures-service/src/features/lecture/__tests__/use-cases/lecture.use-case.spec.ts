import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { Lecture } from "@features/lecture/entities/lecture";
import { LectureRepository } from "@features/lecture/infrastructure/mongo/repositories/lecture.repository";
import { LectureUseCase } from "@features/lecture/use-cases/lecture.use-case";
import {
  getLectureCollection,
  LectureDocument,
} from "@features/lecture/infrastructure/mongo/models/lecture.document";
import { Collection } from "mongodb";
import {
  closeMongoConnection,
  getMongoTestDatabase,
} from "test/test-mongo-client";
import { TEST_LECTURES } from "../mocks/test-data";
import { ILectureUseCase } from "@features/lecture/definitions/lecture.use-case.definition";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("lecture use-case", () => {
  let lectureRepository: LectureRepository;
  let lectureUseCase: ILectureUseCase;
  let lectureCollection: Collection<LectureDocument>;

  beforeAll(async () => {
    const mongoData = getMongoTestDatabase();
    lectureCollection = getLectureCollection(mongoData.mongoDatabase);
    lectureRepository = new LectureRepository(lectureCollection);
    lectureUseCase = new LectureUseCase(lectureRepository);
  });

  afterAll(async () => {
    closeMongoConnection();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await lectureCollection.deleteMany({});
    });

    it("should create a lecture", async () => {
      const lecture = await lectureUseCase.create({
        data: TEST_LECTURES.lecture1,
      });
      expect(lecture).toMatchObject(TEST_LECTURES.lecture1);

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
        description: "test lecture description updated",
      };
      const lecture = await lectureUseCase.update({
        data: inputData,
        searchBy: { id: lecture1.id },
      });
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
      await lectureUseCase.delete({ id: lecture1.id });
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
    });

    it("should get a lecture by id", async () => {
      const lectureRetrieved = await lectureUseCase.getOneBy({
        searchBy: { id: lecture1.id },
      });
      expect(lectureRetrieved).toBeDefined();
    });
    it("should get a lecture by title", async () => {
      const lectureRetrieved = await lectureUseCase.getOneBy({
        searchBy: { title: lecture1.title },
      });
      expect(lectureRetrieved).toBeDefined();
    });
    it("should not get a lecture by id", async () => {
      const lectureRetrieved = await lectureUseCase.getOneBy({
        searchBy: { id: "11111111111aaaaabce4eaff" },
      });
      expect(lectureRetrieved).toBeUndefined();
    });
    it("should not get a lecture by title", async () => {
      const lectureRetrieved = await lectureUseCase.getOneBy({
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
      const lecturesRetrieved = await lectureUseCase.getManyBy({});
      expect(lecturesRetrieved.count).toBe(3);
    });
    it("should get all lectures with name ele", async () => {
      const lectures = await lectureUseCase.getManyBy({
        searchBy: { title: "test" },
      });
      expect(lectures.count).toBe(2);
    });
  });
});
