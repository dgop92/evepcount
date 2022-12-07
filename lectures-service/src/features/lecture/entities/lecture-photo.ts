import Joi from "joi";

export interface LecturePhoto {
  id: string;
  url: string;
}

export const LecturePhotoCreateInputSchema = Joi.object({
  data: Joi.object({
    lectureId: Joi.string().required(),
    image: Joi.string().required(),
  }).required(),
}).meta({ className: "LecturePhotoCreateInput" });

export const LecturePhotoDeleteInputSchema = Joi.object({
  searchBy: Joi.object({
    lectureId: Joi.string().required(),
    imageId: Joi.string().required(),
  }).required(),
}).meta({ className: "LecturePhotoDeleteInput" });
