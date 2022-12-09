from common.types import RawInput
from domain.definitions import IPeopleCountingResultPublisher, IPeopleCountingUseCase
from domain.entities.people_counting_message import PeopleCountingMessage


def listen_for_people_counting_request(
    raw_input: RawInput,
    people_counting_usecase: IPeopleCountingUseCase,
    publisher: IPeopleCountingResultPublisher,
) -> None:
    people_counting_message = PeopleCountingMessage(**raw_input)
    result = people_counting_usecase.getResult(people_counting_message)
    publisher.publish_result(result)
