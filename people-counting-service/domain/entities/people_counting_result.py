from typing import List

from common.utils import to_camel_case
from domain.entities.people_counting_item import PeopleCountingItem
from pydantic import BaseModel


class PeopleCountingResult(BaseModel):
    lecture_id: str
    people_counting_items: List[PeopleCountingItem]

    class Config:
        alias_generator = to_camel_case
        allow_population_by_field_name = True
