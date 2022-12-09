from common.utils import to_camel_case
from pydantic import BaseModel


class PeopleCountingItem(BaseModel):
    image_id: str
    number_of_people: int

    class Config:
        alias_generator = to_camel_case
        allow_population_by_field_name = True
