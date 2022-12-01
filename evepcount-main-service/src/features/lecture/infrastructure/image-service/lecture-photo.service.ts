import { v2 as cloudinary } from "cloudinary";
import {
  ILecturePhotoService,
  LecturePhotoSimplified,
} from "@features/lecture/definitions/lecture-photo.service.definition";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class LecturePhotoService implements ILecturePhotoService {
  private readonly folderName: string;

  constructor(baseFolder: string) {
    this.folderName = `/${baseFolder}/lecture-photos/`;
  }

  async saveAsBase64(base64image: string): Promise<LecturePhotoSimplified> {
    myLogger.info("saving image to cloudinary");
    const result = await cloudinary.uploader.upload(base64image, {
      folder: this.folderName,
    });
    return {
      id: result.public_id,
      url: result.secure_url,
    };
  }

  async delete(imageId: string): Promise<void> {
    myLogger.info("deleting image from cloudinary");
    await cloudinary.uploader.destroy(imageId);
  }
}
