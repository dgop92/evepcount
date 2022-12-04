import { AMQP_CONSTANTS as CONSTANTS } from "./constants";
import { Channel, Replies, Message, Options, ConsumeMessage } from "amqplib";
import { AppLogger } from "@common/logging/logger";

const logger = AppLogger.getAppLogger().createFileLogger(__filename);

export type AmqpCallbackType = (
  err: Error | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedMessage: any,
  originalMessage: ConsumeMessage
) => void;

export type PublishOptions = {
  /**
   * Published message TTL in ms.
   * Up to the underlying layer to deal with it (if supported) and so to not deliver the message if expired.
   */
  ttl?: number | null;
};

export type SubscribeOptions = {
  /**
   * Message TTL in ms.
   * This value is used (if supported) by the underlying layer to not deliver message to the local subscriber if message expired.
   */
  ttl?: number | null;
};

/**
 * Low level AMQP client using AMQP channel the right way.
 *
 * see http://www.squaremobius.net/amqp.node/ for the amqp documentation
 */
export class AmqpClient {
  protected _subscribeCallbackToConsumerTags: Map<AmqpCallbackType, string[]>;
  protected _connected = false;

  constructor(protected channel: Channel) {
    this._subscribeCallbackToConsumerTags = new Map();
  }

  get connected(): boolean {
    return this._connected;
  }

  set connected(value: boolean) {
    this._connected = value;
  }

  async dispose(): Promise<void> {
    logger.info(`Closing the connection`);

    try {
      this.channel.close();
    } catch (err) {
      logger.debug(`Can not close the channel (probably already closed)`, {
        err,
      });
    }
  }

  assertExchange(
    exchange: string,
    type: string
  ): Promise<Replies.AssertExchange> {
    logger.debug(`Assert exchange ${exchange} of type ${type}`);
    return new Promise((r, e) =>
      this.channel.assertExchange(exchange, type).then(r).catch(e)
    );
  }

  ack(message: Message, allUpTo = false): void {
    logger.debug(`Ack message`);
    this.channel.ack(message, allUpTo);
  }

  assertQueue(
    name: string,
    options: Options.AssertQueue
  ): Promise<Replies.AssertQueue> {
    logger.debug(`Assert queue ${name} with options`, options);
    return new Promise((r, e) =>
      this.channel
        .assertQueue(name, options)
        .then((result) => {
          logger.debug(`$Queue created %o`, result);

          return result;
        })
        .then(r)
        .catch(e)
    );
  }

  assertBinding(
    queue: string,
    exchange: string,
    routingPattern: string
  ): Promise<Replies.Empty> {
    logger.debug(
      `Bind queue ${queue} on exchange ${exchange} with pattern ${routingPattern}`
    );
    return new Promise((r, e) =>
      this.channel.bindQueue(queue, exchange, routingPattern).then(r).catch(e)
    );
  }

  send(
    exchange: string,
    data: unknown,
    routingKey = "",
    options?: Options.Publish
  ): boolean {
    logger.debug(
      `Publish message to exchange ${exchange} with options`,
      options
    );
    return this.channel.publish(
      exchange,
      routingKey,
      dataAsBuffer(data),
      options
    );
  }

  consume(
    queue: string,
    options: Options.Consume,
    callback: AmqpCallbackType
  ): Promise<void> {
    logger.debug(`Consume queue ${queue} with options`, options);
    return new Promise((r, e) =>
      this.channel
        .consume(queue, onMessage, options)
        .then((res) =>
          this._registerNewConsumerTag(callback, res.consumerTag, queue)
        )
        .then(r)
        .catch(e)
    );

    function onMessage(originalMessage: ConsumeMessage) {
      try {
        const message = JSON.parse(originalMessage.content.toString());
        callback(null, message, originalMessage);
      } catch (err) {
        logger.warn("Can not parse the incoming message", { err });
        callback(err, null, originalMessage);
      }
    }
  }

  _registerNewConsumerTag(
    callback: AmqpCallbackType,
    consumerTag: string,
    queueName: string
  ): void {
    const sameCallbackTags =
      this._subscribeCallbackToConsumerTags.get(callback) || [];

    sameCallbackTags.push(consumerTag);
    this._subscribeCallbackToConsumerTags.set(callback, sameCallbackTags);

    logger.info(
      `A new consumer has been created for queue ${queueName}: ${consumerTag}`
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dataAsBuffer(data: any): Buffer {
  return Buffer.from(JSON.stringify(data));
}
