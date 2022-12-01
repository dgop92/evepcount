import { promises as fs } from "fs";
import { v2 as cloudinary } from "cloudinary";

import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { LecturePhotoService } from "@features/lecture/infrastructure/image-service/lecture-photo.service";
import { addBase64Prefix } from "@common/fileHelpers";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { LecturePhotoSimplified } from "@features/lecture/definitions/lecture-photo.service.definition";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

async function cloudinaryResourceExits(publicId: string) {
  // wait for cloudinary to process the image
  await new Promise((r) => setTimeout(r, 1800));
  const result = await cloudinary.search
    .expression(`public_id=${publicId}`)
    .max_results(1)
    .execute();
  return (
    result.total_count === 1 && result?.resources?.[0]?.public_id == publicId
  );
}

describe("cloudinary service", () => {
  let lecturePhotoService: LecturePhotoService;
  let photoLecture1: LecturePhotoSimplified;

  beforeAll(async () => {
    const baseFolder = APP_ENV_VARS.cloudinary.baseFolder;
    lecturePhotoService = new LecturePhotoService(baseFolder);
    await cloudinary.api.delete_resources_by_prefix(
      `${baseFolder}/lecture-photos`
    );
    const base64Content = await fs.readFile(
      "./src/features/lecture/__tests__/mocks/test-images/test-image-1.jpg",
      {
        encoding: "base64",
      }
    );
    photoLecture1 = await lecturePhotoService.saveAsBase64(
      addBase64Prefix("jpg", base64Content)
    );
  });

  describe("Save", () => {
    it("should save an image", async () => {
      const base64Content = await fs.readFile(
        "./src/features/lecture/__tests__/mocks/test-images/test-image-2.png",
        {
          encoding: "base64",
        }
      );
      const photo = await lecturePhotoService.saveAsBase64(
        addBase64Prefix("png", base64Content)
      );
      const photoExists = await cloudinaryResourceExits(photo.id);
      expect(photoExists).toBe(true);
    });
  });

  describe("Delete", () => {
    it("should delete an image", async () => {
      await lecturePhotoService.delete(photoLecture1.id);
      const photoExistsAfterDelete = await cloudinaryResourceExits(
        photoLecture1.id
      );
      expect(photoExistsAfterDelete).toBe(false);
    });
  });
});
