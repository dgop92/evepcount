import { ErrorCode, PresentationError } from "@common/errors";
import { ILectureUseCase } from "@features/lecture/definitions/lecture.use-case.definition";
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
} from "@nestjs/common";

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
  constructor() {
    const { lectureUseCase } = myLectureFactory();
    this.lectureUseCase = lectureUseCase;
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
    const business = await this.lectureUseCase.getOneBy({
      searchBy: { id },
      options: {
        fetchPeopleCountingPhotos: query?.fetchPeopleCountingPhotos,
        fetchPhotos: query?.fetchPhotos,
      },
    });
    if (!business) {
      throw new PresentationError("business not found", ErrorCode.NOT_FOUND);
    }
    return business;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() data: UpdateLectureRequest) {
    return this.lectureUseCase.update({ data, searchBy: { id } });
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.lectureUseCase.delete({ id });
  }
}
