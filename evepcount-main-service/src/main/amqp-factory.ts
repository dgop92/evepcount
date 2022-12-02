import amqplib from "amqplib";
import { AmqpClient } from "@common/message-queue/amqp-client";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { AMQP_CONSTANTS } from "@common/message-queue/constants";
import { PEOPLE_COUNTING_EXCHANGE } from "@features/lecture/definitions/people-counting-publisher.definition";

let amqpClient: AmqpClient;

export async function amqpClientFactory() {
  if (amqpClient === undefined) {
    const connection = await amqplib.connect(APP_ENV_VARS.rabbitmq.url);
    const channel = await connection.createChannel();
    amqpClient = new AmqpClient(channel);
    amqpClient.connected = true;

    const { exchange } = await amqpClient.assertExchange(
      PEOPLE_COUNTING_EXCHANGE,
      AMQP_CONSTANTS.EXCHANGE_TYPES.direct
    );
    const { queue } = await amqpClient.assertQueue("pcount-request-queue", {
      durable: true,
    });
    await amqpClient.assertBinding(queue, exchange, "pcount-request");
  }
  return amqpClient;
}

export function closeAmqpClient() {
  if (amqpClient !== undefined) {
    amqpClient.dispose();
  }
}
