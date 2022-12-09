from typing import List

from domain.entities.lecture_photo import LecturePhoto
from pydantic import BaseModel, Field


class PeopleCountingMessage(BaseModel):
    lecture_id: str = Field(alias="lectureId")
    photos: List[LecturePhoto]
