from typing import List, Tuple

import face_recognition
import numpy.typing as npt


class HOGFaceDetection:
    def get_face_locations(
        self,
        imageAsArray: npt.NDArray,
    ) -> List[Tuple[int, int, int, int]]:
        """
        Returns a list of tuples of detected faces in the image.

        Each tuple contains the coordinates of the top, right, bottom, and left
        """
        face_locations = face_recognition.face_locations(
            imageAsArray,
            model="hog",
            number_of_times_to_upsample=2,
        )
        return face_locations
