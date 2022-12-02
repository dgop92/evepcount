import Joi from "joi";
import { LecturePhoto } from "./lecture-photo";

export interface PeopleCountingMessage {
  lectureId: string;
  photos: LecturePhoto[];
}

export const PeopleCountingMessageCreateInputSchema = Joi.object({
  data: Joi.object({
    lectureId: Joi.string().required(),
    imageIds: Joi.array().items(Joi.string().required()).required(),
  }).required(),
}).meta({ className: "PeopleCountingMessageCreateInput" });
