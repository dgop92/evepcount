from typing import List, Protocol, Tuple

import numpy.typing as npt
from domain.entities.people_counting_message import PeopleCountingMessage
from domain.entities.people_counting_result import PeopleCountingResult


class IFaceDetectionService(Protocol):
    def get_face_locations(
        self,
        imageAsArray: npt.NDArray,
    ) -> List[Tuple[int, int, int, int]]:
        """
        Returns a list of tuples of detected faces in the image.

        Each tuple contains the coordinates of the top, right, bottom, and left
        """
        ...


class IImageTransformerService(Protocol):
    def get_image_as_array_from_url(self, url: str) -> npt.NDArray:
        """
        Returns a numpy array of the image
        """
        ...


class IPeopleCountingResultPublisher(Protocol):
    def publish_result(self, result: PeopleCountingResult) -> None:
        """
        Publishes the result to the queue
        """
        ...


class IPeopleCountingUseCase(Protocol):
    def getResult(self, input: PeopleCountingMessage) -> PeopleCountingResult:
        """
        Returns the result of the people counting
        """
        ...
