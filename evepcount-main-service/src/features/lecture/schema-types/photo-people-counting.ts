/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface PeopleCountingResultInput {
  data: {
    lectureId: string;
    peopleCountingPhotos: {
      imageId: string;
      numberOfPeople: number;
    }[];
  };
}
