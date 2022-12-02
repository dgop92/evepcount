import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { AppLogger } from "@common/logging/logger";
import { AmqpClient } from "@common/message-queue/amqp-client";
import { IPeopleCountingPublisher } from "../definitions/people-counting-publisher.definition";
import { PeopleCountingPublisher } from "../infrastructure/message-queue/people-counting-publisher";
import { PeopleCountingPublisherMock } from "../infrastructure/message-queue/people-counting-publisher.mock";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let peopleCountingPublisher: IPeopleCountingPublisher;

export function myPeopleCountingFactory(amqpClient?: AmqpClient) {
  myLogger.info("calling people counting factory");

  if (peopleCountingPublisher === undefined) {
    myLogger.info("creating people counting publisher");
    if (APP_ENV_VARS.isTest) {
      peopleCountingPublisher = new PeopleCountingPublisherMock();
    } else {
      if (amqpClient === undefined) {
        throw new Error("amqpClient is undefined");
      }
      peopleCountingPublisher = new PeopleCountingPublisher(amqpClient);
    }
    myLogger.info("people counting publisher created");
  }

  return {
    peopleCountingPublisher,
  };
}
