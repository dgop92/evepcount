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
import { ApplicationError, ErrorCode } from "@common/errors";
import { myLectureFactory } from "@features/lecture/factories/lecture.factory";
import { myLecturePhotoFactory } from "@features/lecture/factories/lecture-photo.factory";
import { myPeopleCountingFactory } from "@features/lecture/factories/people-counting.factory";
import { LecturePhotoUseCase } from "@features/lecture/use-cases/lecture-photo.use-case";

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

    const lectureFactory = myLectureFactory(db);
    const lecturePhotoFactory = myLecturePhotoFactory(db);
    const { peopleCountingPublisher } = myPeopleCountingFactory();

    lecturePhotoUseCase = lecturePhotoFactory.lecturePhotoUseCase;
    lectureRepository = lectureFactory.lectureRepository;

    (lecturePhotoUseCase as LecturePhotoUseCase).setDependencies(
      lectureFactory.lectureUseCase,
      peopleCountingPublisher
    );

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
    it("should throw an error if lecture doesn't exist", async () => {
      try {
        await lecturePhotoUseCase.create({
          data: { image: "dummy_image", lectureId: "11111111111aaaaabce4eaff" },
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
    it("should throw an error if lecture doesn't exist", async () => {
      try {
        await lecturePhotoUseCase.delete({
          searchBy: {
            imageId: lecturePhoto1.id,
            lectureId: "11111111111aaaaabce4eaff",
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
    it("should throw an error if image id doesn't exist", async () => {
      try {
        await lecturePhotoUseCase.delete({
          searchBy: {
            imageId: "dummy_image_id",
            lectureId: lecture1.id,
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

  describe("People Counting Results", () => {
    let lecturePhoto1: LecturePhoto;
    let lecturePhoto2: LecturePhoto;
    let lecturePhoto3: LecturePhoto;

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
        lecturePhotoUseCase.create({
          data: {
            image: "dummy_image",
            lectureId: lecture1.id,
          },
        }),
      ]);
      lecturePhoto1 = photos[0];
      lecturePhoto2 = photos[1];
      lecturePhoto3 = photos[2];
    });

    it("should add people counting items to a lecture", async () => {
      await lecturePhotoUseCase.addPeopleCountingResults({
        data: {
          lectureId: lecture1.id,
          peopleCountingItems: [
            { imageId: lecturePhoto1.id, numberOfPeople: 10 },
          ],
        },
      });
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
        options: { fetchPeopleCountingItems: true },
      });
      expect(lectureRetrieved?.peopleCountingItems?.length).toBe(1);
      expect(lectureRetrieved?.peopleCountingItems?.[0].imageId).toBe(
        lecturePhoto1.id
      );
      expect(lectureRetrieved?.peopleCountingItems?.[0].numberOfPeople).toBe(
        10
      );
    });
    it("should update people counting items of a lecture", async () => {
      await lecturePhotoUseCase.addPeopleCountingResults({
        data: {
          lectureId: lecture1.id,
          peopleCountingItems: [
            { imageId: lecturePhoto1.id, numberOfPeople: 10 },
            { imageId: lecturePhoto2.id, numberOfPeople: 20 },
          ],
        },
      });
      await lecturePhotoUseCase.addPeopleCountingResults({
        data: {
          lectureId: lecture1.id,
          peopleCountingItems: [
            { imageId: lecturePhoto1.id, numberOfPeople: 1000 },
          ],
        },
      });
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
        options: { fetchPeopleCountingItems: true },
      });
      expect(lectureRetrieved?.peopleCountingItems).toHaveLength(2);
      const pci1 = lectureRetrieved?.peopleCountingItems?.find(
        (pci) => pci.imageId === lecturePhoto1.id
      );
      expect(pci1?.numberOfPeople).toBe(1000);
      const pci2 = lectureRetrieved?.peopleCountingItems?.find(
        (pci) => pci.imageId === lecturePhoto2.id
      );
      expect(pci2?.numberOfPeople).toBe(20);
    });
    it("should update and create people counting items of a lecture", async () => {
      await lecturePhotoUseCase.addPeopleCountingResults({
        data: {
          lectureId: lecture1.id,
          peopleCountingItems: [
            { imageId: lecturePhoto1.id, numberOfPeople: 10 },
          ],
        },
      });
      await lecturePhotoUseCase.addPeopleCountingResults({
        data: {
          lectureId: lecture1.id,
          peopleCountingItems: [
            { imageId: lecturePhoto1.id, numberOfPeople: 1000 },
            { imageId: lecturePhoto2.id, numberOfPeople: 20 },
            { imageId: lecturePhoto3.id, numberOfPeople: 30 },
          ],
        },
      });
      const lectureRetrieved = await lectureRepository.getOneBy({
        searchBy: { id: lecture1.id },
        options: { fetchPeopleCountingItems: true },
      });
      expect(lectureRetrieved?.peopleCountingItems).toHaveLength(3);
      const pci1 = lectureRetrieved?.peopleCountingItems?.find(
        (pci) => pci.imageId === lecturePhoto1.id
      );
      expect(pci1?.numberOfPeople).toBe(1000);
      const pci2 = lectureRetrieved?.peopleCountingItems?.find(
        (pci) => pci.imageId === lecturePhoto2.id
      );
      expect(pci2?.numberOfPeople).toBe(20);
      const pci3 = lectureRetrieved?.peopleCountingItems?.find(
        (pci) => pci.imageId === lecturePhoto3.id
      );
      expect(pci3?.numberOfPeople).toBe(30);
    });
    it("should throw an error if lecture doesn't exits", async () => {
      try {
        await lecturePhotoUseCase.addPeopleCountingResults({
          data: {
            lectureId: "11111111111aaaaabce4eaff",
            peopleCountingItems: [
              { imageId: lecturePhoto1.id, numberOfPeople: 10 },
            ],
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
    it("should throw an error if a photo doesn't exits inside a lecture", async () => {
      try {
        await lecturePhotoUseCase.addPeopleCountingResults({
          data: {
            lectureId: lecture1.id,
            peopleCountingItems: [
              { imageId: "dumy_image_id", numberOfPeople: 10 },
            ],
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.INVALID_OPERATION);
        }
      }
    });
  });

  describe("Send People Counting Messages", () => {
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
