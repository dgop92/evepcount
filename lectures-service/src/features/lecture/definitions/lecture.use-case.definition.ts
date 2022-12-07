import { SLPaginationResult } from "@common/types/common-types";

import { Lecture } from "../entities/lecture";
import {
  LectureCreateInput,
  LectureSearchInput,
  LectureUpdateInput,
} from "../schema-types";

export type LectureLookUpInput = {
  id: string;
};

export interface ILectureUseCase {
  create(input: LectureCreateInput): Promise<Lecture>;
  update(input: LectureUpdateInput): Promise<Lecture>;
  delete(input: LectureLookUpInput): Promise<void>;
  getOneBy(input: LectureSearchInput): Promise<Lecture | undefined>;
  getManyBy(input: LectureSearchInput): Promise<SLPaginationResult<Lecture>>;
}
