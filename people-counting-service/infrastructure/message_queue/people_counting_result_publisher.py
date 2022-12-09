from domain.entities.people_counting_result import PeopleCountingResult
from pika.adapters.blocking_connection import BlockingChannel


class PeopleCountingResultPublisher:
    def __init__(self, channel: BlockingChannel) -> None:
        self.channel = channel

    def publish_result(self, result: PeopleCountingResult) -> None:
        """
        Publishes the result to the queue
        """
        self.channel.queue_declare(queue="pcount-replay-queue", durable=True)
        self.channel.basic_publish(
            exchange="",
            routing_key="pcount-replay-queue",
            body=result.json(by_alias=True),
        )
