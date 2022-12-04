import { AppLogger } from "@common/logging/logger";
import { MessageQueueClient } from "@common/message-queue/message-queue.client";
import { IPeopleCountingPublisher } from "../../definitions/people-counting-publisher.definition";
import { PeopleCountingMessage } from "../../entities/people-counting-message";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class PeopleCountingPublisher implements IPeopleCountingPublisher {
  constructor(private readonly messageQueueClient: MessageQueueClient) {}

  async publish(input: PeopleCountingMessage): Promise<void> {
    myLogger.debug("publishing people counting message to request queue", {
      input,
    });
    // Publish message directly to the queue
    this.messageQueueClient.publish<PeopleCountingMessage>(
      "default",
      { data: input },
      "pcount-request-queue"
    );
  }
}
