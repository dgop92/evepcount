from pydantic import BaseModel


class LecturePhoto(BaseModel):
    id: str
    url: str
