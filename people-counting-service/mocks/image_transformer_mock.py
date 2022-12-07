import numpy as np
import numpy.typing as npt


class ImageTransformerMock:
    def get_image_as_array_from_url(self, url: str) -> npt.ArrayLike:
        """
        Returns a numpy array of the image
        """
        ...
        return np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
