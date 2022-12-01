import { ErrorCode, PresentationError } from "@common/errors";
import { ILecturePhotoUseCase } from "@features/lecture/definitions/lecture-photo.use-case.definition";
import { ILectureUseCase } from "@features/lecture/definitions/lecture.use-case.definition";
import { myLecturePhotoFactory } from "@features/lecture/factories/lecture-photo.factory";
import { myLectureFactory } from "@features/lecture/factories/lecture.factory";
import {
  LectureCreateInput,
  LectureSearchInput,
  LectureUpdateInput,
} from "@features/lecture/schema-types";
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

type CreateLectureRequest = LectureCreateInput["data"];
type UpdateLectureRequest = LectureUpdateInput["data"];

type QueryParams = LectureSearchInput["searchBy"] &
  LectureSearchInput["options"];
type QueryParamsWithPagination = QueryParams & LectureSearchInput["pagination"];

@Controller({
  path: "lectures",
  version: "1",
})
export class LectureControllerV1 {
  private lectureUseCase: ILectureUseCase;
  private lecturePhotoUseCase: ILecturePhotoUseCase;
  constructor() {
    const { lectureUseCase } = myLectureFactory();
    const { lecturePhotoUseCase } = myLecturePhotoFactory();
    this.lectureUseCase = lectureUseCase;
    this.lecturePhotoUseCase = lecturePhotoUseCase;
  }

  @Post()
  create(@Body() data: CreateLectureRequest) {
    return this.lectureUseCase.create({ data });
  }

  @Get()
  getMany(@Query() query: QueryParamsWithPagination) {
    return this.lectureUseCase.getManyBy({
      searchBy: { id: query?.id, title: query?.title },
      pagination: { limit: query?.limit, skip: query?.skip },
      options: {
        fetchPeopleCountingPhotos: query?.fetchPeopleCountingPhotos,
        fetchPhotos: query?.fetchPhotos,
      },
    });
  }

  @Get(":id")
  async getOne(
    @Param("id") id: string,
    @Query() query: LectureSearchInput["options"]
  ) {
    const lecture = await this.lectureUseCase.getOneBy({
      searchBy: { id },
      options: {
        fetchPeopleCountingPhotos: query?.fetchPeopleCountingPhotos,
        fetchPhotos: query?.fetchPhotos,
      },
    });
    if (!lecture) {
      throw new PresentationError("lecture not found", ErrorCode.NOT_FOUND);
    }
    return lecture;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() data: UpdateLectureRequest) {
    return this.lectureUseCase.update({ data, searchBy: { id } });
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.lectureUseCase.delete({ id });
  }

  @Post(":id/photos")
  @UseInterceptors(FileInterceptor("file"))
  async addPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Param("id") id: string
  ) {
    const base64Content = file.buffer.toString("base64");
    const fileAsBase64 = `data:${file.mimetype};base64,${base64Content}`;
    const lecturePhoto = await this.lecturePhotoUseCase.create({
      data: { lectureId: id, image: fileAsBase64 },
    });
    return lecturePhoto;
  }

  @Get(":id/photos")
  getAllPhotos(@Param("id") id: string) {
    return this.lecturePhotoUseCase.getManyBy(id);
  }

  @Delete(":id/photos/:photoId")
  removePhoto(@Param("id") id: string, @Param("photoId") photoId: string) {
    return this.lecturePhotoUseCase.delete({
      searchBy: {
        imageId: photoId,
        lectureId: id,
      },
    });
  }
}
