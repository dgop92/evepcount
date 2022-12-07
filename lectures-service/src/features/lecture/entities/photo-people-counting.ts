import Joi from "joi";

export interface PhotoPeopleCounting {
  imageId: string;
  numberOfPeople: number;
}

export interface PeopleCountingResult {
  lectureId: string;
  peopleCountingPhotos: PhotoPeopleCounting[];
}

export const PeopleCountingResultInputSchema = Joi.object({
  data: Joi.object({
    lectureId: Joi.string().required(),
    peopleCountingPhotos: Joi.array()
      .items(
        Joi.object({
          imageId: Joi.string().required(),
          numberOfPeople: Joi.number().required(),
        }).required()
      )
      .required(),
  }).required(),
}).meta({ className: "PeopleCountingResultInput" });
