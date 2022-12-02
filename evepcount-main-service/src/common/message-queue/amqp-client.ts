import { AMQP_CONSTANTS as CONSTANTS } from "./constants";
import { Channel, Replies, Message, Options, ConsumeMessage } from "amqplib";
import { AppLogger } from "@common/logging/logger";

const logger = AppLogger.getAppLogger().createFileLogger(__filename);

export type AmqpCallbackType = (
  err: Error,
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

/**
 * Low level AMQP client using AMQP channel the right way.
 *
 * see http://www.squaremobius.net/amqp.node/ for the amqp documentation
 */
export class AmqpClient {
  protected _connected = false;

  constructor(protected channel: Channel) {}

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
    type = CONSTANTS.EXCHANGE_TYPES.topic
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
    logger.debug(`Assert queue ${name} with options %o`, options);
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
      `Publish message to exchange ${exchange} with options %o`,
      options
    );
    return this.channel.publish(
      exchange,
      routingKey,
      dataAsBuffer(data),
      options
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dataAsBuffer(data: any): Buffer {
  return Buffer.from(JSON.stringify(data));
}
