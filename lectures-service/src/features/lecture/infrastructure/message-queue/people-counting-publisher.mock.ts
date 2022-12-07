import { AppLogger } from "@common/logging/logger";
import { IPeopleCountingPublisher } from "../../definitions/people-counting-publisher.definition";
import { PeopleCountingMessage } from "../../entities/people-counting-message";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class PeopleCountingPublisherMock implements IPeopleCountingPublisher {
  async publish(input: PeopleCountingMessage): Promise<void> {
    myLogger.debug("publishing people counting message to mock message queue", {
      input,
    });
  }
}
