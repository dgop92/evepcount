export const AMQP_CONSTANTS = {
  DEFAULT_AMQP_PROTOCOL: "amqp",
  DEFAULT_AMQP_HOST: "localhost",
  DEFAULT_AMQP_PORT: "5672",
  DEFAULT_AMQP_USERNAME: "guest",
  DEFAULT_AMQP_PASSWORD: "guest",

  EXCHANGE_TYPES: {
    pubsub: "fanout",
    topic: "topic",
    direct: "direct",
  },

  PUBSUB_EXCHANGE: {
    type: "fanout",
    routingKey: "", // not considered for 'fanout' exchange
    encoding: "utf8",
  },
};
