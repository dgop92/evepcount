import { AppLogger } from "@common/logging/logger";
import { AmqpClient } from "@common/message-queue/amqp-client";
import {
  IPeopleCountingPublisher,
  PEOPLE_COUNTING_EXCHANGE,
} from "../../definitions/people-counting-publisher.definition";
import { PeopleCountingMessage } from "../../entities/people-counting-message";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class PeopleCountingPublisher implements IPeopleCountingPublisher {
  constructor(private readonly amqpClient: AmqpClient) {}

  async publish(input: PeopleCountingMessage): Promise<void> {
    myLogger.debug("publishing people counting message", {
      input,
    });
    this.amqpClient.send(PEOPLE_COUNTING_EXCHANGE, input, "pcount-request");
  }
}
