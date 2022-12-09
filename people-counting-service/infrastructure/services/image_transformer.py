import io

import numpy as np
import numpy.typing as npt
import requests
from PIL import Image


class ImageTransformerMock:
    def get_image_as_array_from_url(self, url: str) -> npt.ArrayLike:
        """
        Returns a numpy array of the image
        """
        response = requests.get(url)
        bytes_im = io.BytesIO(response.content)
        image = Image.open(bytes_im)
        return np.array(image)
