import { Lecture } from "../entities/lecture";
import {
  LectureCreateInput,
  LectureSearchInput,
  LectureUpdateInput,
} from "../schema-types";
import { SLPaginationResult } from "@common/types/common-types";

export type LectureCreateRepoData = LectureCreateInput["data"];
export type LectureUpdateRepoData = LectureUpdateInput["data"];

export interface ILectureRepository {
  create(input: LectureCreateRepoData): Promise<Lecture>;
  update(lecture: Lecture, input: LectureUpdateRepoData): Promise<Lecture>;
  delete(lecture: Lecture): Promise<void>;
  getOneBy(input: LectureSearchInput): Promise<Lecture | undefined>;
  getManyBy(input: LectureSearchInput): Promise<SLPaginationResult<Lecture>>;
}
