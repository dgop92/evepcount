import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { AppLogger } from "@common/logging/logger";
import { MessageQueueClient } from "@common/message-queue/message-queue.client";
import { IPeopleCountingPublisher } from "../definitions/people-counting-publisher.definition";
import { PeopleCountingPublisher } from "../infrastructure/message-queue/people-counting-publisher";
import { PeopleCountingPublisherMock } from "../infrastructure/message-queue/people-counting-publisher.mock";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let peopleCountingPublisher: IPeopleCountingPublisher;

export function myPeopleCountingFactory(
  messageQueueClient?: MessageQueueClient
) {
  myLogger.info("calling people counting factory");

  if (peopleCountingPublisher === undefined) {
    myLogger.info("creating people counting publisher");
    if (APP_ENV_VARS.isTest) {
      peopleCountingPublisher = new PeopleCountingPublisherMock();
    } else {
      if (messageQueueClient === undefined) {
        throw new Error("messageQueueClient is undefined");
      }
      peopleCountingPublisher = new PeopleCountingPublisher(messageQueueClient);
    }
    myLogger.info("people counting publisher created");
  }

  return {
    peopleCountingPublisher,
  };
}
