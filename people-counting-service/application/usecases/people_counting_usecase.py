from domain.definitions import IFaceDetectionService, IImageTransformerService
from domain.entities.people_counting_item import PeopleCountingItem
from domain.entities.people_counting_message import PeopleCountingMessage
from domain.entities.people_counting_result import PeopleCountingResult


class PeopleCountingUseCase:
    def __init__(
        self,
        imageTransfomer: IImageTransformerService,
        faceDetector: IFaceDetectionService,
    ) -> None:
        self.imageTransformer = imageTransfomer
        self.faceDetector = faceDetector

    def getResult(self, input: PeopleCountingMessage) -> PeopleCountingResult:
        """
        Returns the result of the people counting
        """
        images = {}
        for photo in input.photos:
            imageAsArray = self.imageTransformer.get_image_as_array_from_url(photo.url)
            images[photo.id] = imageAsArray

        people_counting_items = []
        for photo in input.photos:
            faceLocations = self.faceDetector.get_face_locations(images[photo.id])
            people_counting_items.append(
                PeopleCountingItem(
                    image_id=photo.id,
                    number_of_people=len(faceLocations),
                )
            )

        return PeopleCountingResult(
            lecture_id=input.lecture_id,
            people_counting_items=people_counting_items,
        )
