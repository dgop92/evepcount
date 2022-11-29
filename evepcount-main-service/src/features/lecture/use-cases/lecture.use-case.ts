import Joi from "joi";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import { SLPaginationResult } from "@common/types/common-types";
import {
  Lecture,
  LectureCreateInputSchema,
  LectureSearchInputSchema,
  LectureUpdateInputSchema,
} from "../entities/lecture";
import { ILectureRepository } from "../definitions/lecture.repository.definition";
import {
  LectureLookUpInput,
  ILectureUseCase,
} from "../definitions/lecture.use-case.definition";
import {
  LectureCreateInput,
  LectureSearchInput,
  LectureUpdateInput,
} from "../schema-types";
import { ApplicationError, ErrorCode } from "@common/errors";
import { StringLookUpInputSchema } from "@common/schemas/idValidations";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class LectureUseCase implements ILectureUseCase {
  constructor(private readonly repository: ILectureRepository) {}

  async create(input: LectureCreateInput): Promise<Lecture> {
    this.validateInput(LectureCreateInputSchema, input);
    return this.repository.create(input.data);
  }

  async update(input: LectureUpdateInput): Promise<Lecture> {
    this.validateInput(LectureUpdateInputSchema, input);
    const lecture = await this.repository.getOneBy({
      searchBy: { id: input.searchBy.id },
    });

    if (!lecture) {
      throw new ApplicationError("lecture not found", ErrorCode.NOT_FOUND);
    }

    return this.repository.update(lecture, input.data);
  }

  async delete(input: LectureLookUpInput): Promise<void> {
    this.validateInput(StringLookUpInputSchema, input);
    const lecture = await this.repository.getOneBy({
      searchBy: { id: input.id },
    });

    if (!lecture) {
      throw new ApplicationError("lecture not found", ErrorCode.NOT_FOUND);
    }

    return this.repository.delete(lecture);
  }

  getOneBy(input: LectureSearchInput): Promise<Lecture | undefined> {
    this.validateInput(LectureSearchInputSchema, input);
    return this.repository.getOneBy(input);
  }

  getManyBy(input: LectureSearchInput): Promise<SLPaginationResult<Lecture>> {
    this.validateInput(LectureSearchInputSchema, input);
    return this.repository.getManyBy(input);
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
