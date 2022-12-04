import amqplib from "amqplib";
import { AmqpClient } from "@common/message-queue/amqp-client";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { MessageQueueClient } from "@common/message-queue/message-queue.client";

let amqpClient: AmqpClient;
let messageQueueClient: MessageQueueClient;

export async function messageQueueClientFactory() {
  if (amqpClient === undefined) {
    const connection = await amqplib.connect(APP_ENV_VARS.rabbitmq.url);
    const channel = await connection.createChannel();
    amqpClient = new AmqpClient(channel);
    amqpClient.connected = true;
    messageQueueClient = new MessageQueueClient(amqpClient);
  }
  return {
    amqpClient,
    messageQueueClient,
  };
}

export function closeAmqpClient() {
  if (amqpClient !== undefined) {
    amqpClient.dispose();
  }
}
