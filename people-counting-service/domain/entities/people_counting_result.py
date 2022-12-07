from typing import List

from domain.entities.people_counting_item import PeopleCountingItem
from pydantic import BaseModel


class PeopleCountingResult(BaseModel):
    lecture_id: str
    peopleCountingItems: List[PeopleCountingItem]
