import {
  MessageQueueMessage,
  MessageQueueListener,
  MessageQueueSubscriptionOptions,
  MessageQueueExchange,
  MessageQueueQueue,
} from "./message-queue.definitions";
import { AmqpCallbackType, SubscribeOptions } from "./amqp-client";
import { AmqpClient } from "./amqp-client";
import { AppLogger } from "@common/logging/logger";

const logger = AppLogger.getAppLogger().createFileLogger(__filename);

export class MessageQueueClient {
  constructor(private client: AmqpClient) {}

  close(): Promise<void> {
    return this.client.dispose();
  }

  async publish<T>(
    exchange: MessageQueueExchange | "default",
    message: MessageQueueMessage<T>,
    routingKey = ""
  ): Promise<void> {
    logger.debug("publishing message to exchange with rk", {
      exchange,
      routingKey,
    });
    if (exchange !== "default") {
      await this.client.assertExchange(exchange.name, exchange.type);
    }
    const exchangeName = exchange === "default" ? "" : exchange.name;
    this.client.send(exchangeName, message.data, routingKey, {
      expiration: message.ttl,
    });
  }

  async subscribe<T>(
    queue: MessageQueueQueue,
    listener: MessageQueueListener<T>,
    options: MessageQueueSubscriptionOptions = {
      ack: false,
      ttl: -1,
    }
  ): Promise<void> {
    const subscribeOptions: SubscribeOptions = {};
    logger.debug("subscribing to topic with options", options);

    const callback: AmqpCallbackType = (err, message, originalMessage) => {
      const data = err ? originalMessage : message;

      if (err) {
        logger.error(
          `received a message from ${queue.name} which can not be parsed`,
          { content: originalMessage?.content.toString() }
        );
      } else {
        try {
          listener({
            data,
            ack: (): void => {
              logger.debug(`ack message on queue ${queue.name}`);
              this.client.ack(originalMessage);
            },
          });
        } catch (error) {
          logger.error(`error while processing message`, { error });
        }
      }
    };

    if (options.ttl && options.ttl > 0) {
      subscribeOptions.ttl = options.ttl;
    }

    await this.client.assertQueue(queue.name, {
      durable: queue.options.durable,
    });
    this.client.consume(queue.name, { noAck: options.ack }, callback);
  }
}
