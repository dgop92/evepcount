import json
import logging
import os
import sys

import pika
from application.usecases.people_counting_usecase import PeopleCountingUseCase
from common.logging import config_logger
from common.settings import RABBITMQ_URL
from infrastructure.message_queue.listeners import listen_for_people_counting_request
from infrastructure.message_queue.people_counting_result_publisher import (
    PeopleCountingResultPublisher,
)
from infrastructure.services.face_detection import HOGFaceDetection
from infrastructure.services.image_transformer import ImageTransformer
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties

config_logger()
logger = logging.getLogger(__name__)
logging.getLogger("pika").setLevel(logging.WARNING)
logging.getLogger("PIL.PngImagePlugin").setLevel(logging.WARNING)

people_counting_usecase: PeopleCountingUseCase = None
people_counting_result_publisher: PeopleCountingResultPublisher = None


def callback(
    ch: BlockingChannel, method: Basic.Deliver, properties: BasicProperties, body
):
    logger.debug("received message: %s", body)
    try:
        parsed_body = body.decode("utf-8")
        body_as_dict = json.loads(parsed_body)
        listen_for_people_counting_request(
            body_as_dict, people_counting_usecase, people_counting_result_publisher
        )
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except json.JSONDecodeError:
        logger.warning("cannot parse body: %s", body)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        logger.exception("error while processing message: %s", body)
        ch.basic_ack(delivery_tag=method.delivery_tag)


def start_rabbitmq():
    logger.info("connecting to rabbitmq")
    connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
    channel = connection.channel()
    logger.info("connected to rabbitmq")

    global people_counting_result_publisher
    people_counting_result_publisher = PeopleCountingResultPublisher(channel)

    channel.queue_declare(queue="pcount-request-queue", durable=True)
    channel.basic_consume(
        queue="pcount-request-queue", on_message_callback=callback, auto_ack=False
    )

    logger.info("waiting for messages, press CTRL+C to exit")
    channel.start_consuming()


def main():
    image_transformer = ImageTransformer()
    face_detector = HOGFaceDetection()
    global people_counting_usecase
    people_counting_usecase = PeopleCountingUseCase(image_transformer, face_detector)
    start_rabbitmq()


if __name__ == "__main__":
    try:
        logger.info("app started")
        main()
    except KeyboardInterrupt:
        logger.info("app stopped")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
