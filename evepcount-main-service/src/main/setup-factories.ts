import { AmqpClient } from "@common/message-queue/amqp-client";
import { lectureModuleFactory } from "@features/lecture/factories";
import { Db } from "mongodb";

export function setupFactories(database: Db, amqpClient: AmqpClient) {
  lectureModuleFactory({ database, amqpClient });
}
