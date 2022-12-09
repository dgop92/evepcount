import { LecturePhoto } from "./lecture-photo";
import { PeopleCountingItem } from "./people-counting-result";
import Joi from "joi";
import { SkipLimitPaginationSchema } from "@common/schemas/pagination";

export interface Lecture {
  id: string;
  title: string;
  description: string;
  photos?: LecturePhoto[];
  peopleCountingItems?: PeopleCountingItem[];
}

export const LecturePaginationSchema = SkipLimitPaginationSchema.meta({
  className: "LecturePagination",
});

export const LectureOptionsSchema = Joi.object({
  fetchPhotos: Joi.boolean().default(false),
  fetchPeopleCountingItems: Joi.boolean().default(false),
}).meta({ className: "LectureOptions" });

export const LectureCreateInputSchema = Joi.object({
  data: Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(2).max(1000).optional(),
  }).required(),
}).meta({ className: "LectureCreateInput" });

export const LectureUpdateInputSchema = Joi.object({
  data: Joi.object({
    title: Joi.string().min(2).max(100).optional(),
    description: Joi.string().min(2).max(1000).optional(),
  }).required(),
  searchBy: Joi.object({
    id: Joi.string().required(),
  }).required(),
}).meta({ className: "LectureUpdateInput" });

export const LectureSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.string().optional(),
    title: Joi.string().optional(),
  }).optional(),
  options: LectureOptionsSchema,
  pagination: LecturePaginationSchema,
}).meta({ className: "LectureSearchInput" });
