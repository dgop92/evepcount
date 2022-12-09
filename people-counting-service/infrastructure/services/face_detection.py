from typing import List, Tuple

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
        # TODO: Implement this method, so far is just a placeholder
        count = imageAsArray.shape[0]
        return [(0, 0, count, count) for _ in range(count)]
