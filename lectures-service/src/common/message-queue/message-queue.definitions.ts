export enum EXCHANGE_TYPE {
  direct = "direct",
  fanout = "fanout",
  topic = "topic",
}

export type MessageQueueType = "local" | "amqp";

export interface MessageQueueMessage<T> {
  /**
   * Optional message id, mainly used for logs
   */
  id?: string;

  /**
   * The message TTL period in milliseconds
   */
  ttl?: number;

  /**
   * The message payload to process
   */
  data: T;
}

export interface IncomingMessageQueueMessage<T> extends MessageQueueMessage<T> {
  ack: () => void;
}

export type MessageQueueSubscriptionOptions = {
  /**
   * Automatically acknowledge the incoming message when the processing is complete
   */
  ack?: boolean;

  /**
   * Configures the message TTL (in ms) in the underlying messaging system.
   * Negative or undefined means no TTL.
   * Notes:
   * - If supported by the messaging system, messages will not be delivered to the application.
   * - If not supported, this may be up to the subscriber itself to filter messages at the application level based on some timestamp if available.
   */
  ttl?: number | null;
};

export type MessageQueueListener<T> = (
  message: IncomingMessageQueueMessage<T>
) => void;

export type MessageQueueExchange = {
  type: EXCHANGE_TYPE;
  name: string;
};

export type MessageQueueQueue = {
  name: string;
  options: {
    durable: boolean;
  };
};
