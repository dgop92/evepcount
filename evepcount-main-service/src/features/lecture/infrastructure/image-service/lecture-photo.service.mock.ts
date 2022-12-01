import {
  ILecturePhotoService,
  LecturePhotoSimplified,
} from "@features/lecture/definitions/lecture-photo.service.definition";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

function generateImageId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function createUrlFromImageId(imageId: string) {
  return `https://example.com/${imageId}`;
}

export class LecturePhotoMockService implements ILecturePhotoService {
  public static IMAGES: LecturePhotoSimplified[] = [];

  saveAsBase64(base64image: string): Promise<LecturePhotoSimplified> {
    myLogger.info("saving image to mock service");
    const imageId = generateImageId();
    const photoUrl = {
      id: imageId,
      url: createUrlFromImageId(imageId),
    };
    LecturePhotoMockService.IMAGES.push(photoUrl);
    return Promise.resolve(photoUrl);
  }

  async delete(imageId: string): Promise<void> {
    LecturePhotoMockService.IMAGES = LecturePhotoMockService.IMAGES.filter(
      (image) => image.id !== imageId
    );
    myLogger.info("deleting image from mock service");
  }
}
