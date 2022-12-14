import Joi from "joi";

export interface PeopleCountingItem {
  imageId: string;
  numberOfPeople: number;
}

export interface PeopleCountingResult {
  lectureId: string;
  peopleCountingItems: PeopleCountingItem[];
}

export const PeopleCountingResultInputSchema = Joi.object({
  lectureId: Joi.string().required(),
  peopleCountingItems: Joi.array()
    .items(
      Joi.object({
        imageId: Joi.string().required(),
        numberOfPeople: Joi.number().positive().allow(0).required(),
      }).required()
    )
    .required(),
}).meta({ className: "PeopleCountingResultInput" });
