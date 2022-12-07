from pydantic import BaseModel


class PeopleCountingItem(BaseModel):
    image_id: str
    number_of_people: int
