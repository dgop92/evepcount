import pytest
from application.usecases.people_counting_usecase import PeopleCountingUseCase
from domain.entities.lecture_photo import LecturePhoto
from domain.entities.people_counting_message import PeopleCountingMessage
from mocks.face_detection_mock import FaceDetectionMock
from mocks.image_transformer_mock import ImageTransformerMock


@pytest.fixture
def my_people_counting_usecase():
    image_transformer = ImageTransformerMock()
    face_detector = FaceDetectionMock()
    return PeopleCountingUseCase(image_transformer, face_detector)


def test_successful_people_counting_in_photo(
    my_people_counting_usecase: PeopleCountingUseCase,
):
    people_counting_message = PeopleCountingMessage(
        lecture_id="lecture_id",
        photos=[
            LecturePhoto(
                id="photo_id",
                url="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
            ),
            LecturePhoto(
                id="photo_id",
                url="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
            ),
        ],
    )
    result = my_people_counting_usecase.getResult(people_counting_message)
    assert result.lecture_id == "lecture_id"
    assert len(result.peopleCountingItems) == 2
