import { IncomingMessageQueueMessage } from "@common/message-queue/message-queue.definitions";
import { ILecturePhotoUseCase } from "@features/lecture/definitions/lecture-photo.use-case.definition";
import { PeopleCountingResultInput } from "@features/lecture/schema-types";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export const listenForPeopleCountingResults =
  (lecturePhotoUseCase: ILecturePhotoUseCase) =>
  (message: IncomingMessageQueueMessage<PeopleCountingResultInput>) => {
    console.log(message.data);
    lecturePhotoUseCase
      .addPeopleCounting(message.data)
      .then((value) => {
        myLogger.debug("added people counting result", value);
        message.ack();
      })
      .catch((err) => {
        myLogger.error("could not add people counting result", err);
      });
  };
