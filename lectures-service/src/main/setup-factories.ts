import { MessageQueueClient } from "@common/message-queue/message-queue.client";
import { lectureModuleFactory } from "@features/lecture/factories";
import { Db } from "mongodb";

export function setupFactories(
  database: Db,
  messageQueueClient: MessageQueueClient
) {
  lectureModuleFactory({ database, messageQueueClient });
}
