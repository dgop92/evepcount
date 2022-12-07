from typing import List

from domain.entities.lecture_photo import LecturePhoto
from pydantic import BaseModel


class PeopleCountingMessage(BaseModel):
    lecture_id: str
    photos: List[LecturePhoto]
