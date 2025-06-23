import { IMAGE_PATHS } from "../constants/imagePaths";

export const getImagePath = (imagePath, type = "pet") => {
  if (!imagePath) {
    return IMAGE_PATHS.placeholders[type] || IMAGE_PATHS.placeholders.pet;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  return `/assets/${imagePath}`;
};

// THIS WAS THE MISSING FUNCTION!
export const validateImageUrl = async (url) => {
  if (!url) return false;

  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;

      setTimeout(() => resolve(false), 5000);
    });
  } catch (error) {
    return false;
  }
};

export const getPlaceholderImage = (
  width = 400,
  height = 300,
  text = "Pet Photo",
) => {
  return `https://via.placeholder.com/${width}x${height}/cccccc/666666?text=${encodeURIComponent(text)}`;
};

export const getPetImage = (petImagePath) => {
  return getImagePath(petImagePath, "pet");
};

export const getProductImage = (productImagePath) => {
  return getImagePath(productImagePath, "product");
};

export const getBrandImage = (brandImagePath) => {
  return getImagePath(brandImagePath, "brand");
};

export const getAboutImage = (aboutImagePath) => {
  return getImagePath(aboutImagePath, "about");
};
