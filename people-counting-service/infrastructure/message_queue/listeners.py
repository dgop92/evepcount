import logging

from common.types import RawInput
from domain.definitions import IPeopleCountingResultPublisher, IPeopleCountingUseCase
from domain.entities.people_counting_message import PeopleCountingMessage

logger = logging.getLogger(__name__)


def listen_for_people_counting_request(
    raw_input: RawInput,
    people_counting_usecase: IPeopleCountingUseCase,
    publisher: IPeopleCountingResultPublisher,
) -> None:
    logger.debug("validating data %s", raw_input)
    people_counting_message = PeopleCountingMessage(**raw_input)
    logger.debug("counting people %s", people_counting_message)
    result = people_counting_usecase.getResult(people_counting_message)
    logger.debug("publishing result %s", result)
    publisher.publish_result(result)
