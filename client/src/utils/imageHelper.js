// client/src/utils/imageHelper.js (Updated)
import { IMAGE_PATHS } from '../constants/imagePaths';

// Main helper function to get the correct image path
export const getImagePath = (imagePath, type = 'pet') => {
  if (!imagePath) {
    return IMAGE_PATHS.placeholders[type] || IMAGE_PATHS.placeholders.pet;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a local file path starting with /, return as is
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Based on type, return appropriate path
  switch (type) {
    case 'pet':
      return `/images/pets/${imagePath}`;
    case 'product':
      return `/images/products/${imagePath}`;
    case 'brand':
      return `/images/brand/${imagePath}`;
    case 'about':
      return `/images/about/${imagePath}`;
    default:
      return `/images/pets/${imagePath}`;
  }
};

// Helper to validate image URL
export const validateImageUrl = async (url) => {
  if (!url) return false;
  
  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(false), 5000);
    });
  } catch (error) {
    return false;
  }
};

// Generate placeholder image URL
export const getPlaceholderImage = (width = 400, height = 300, text = 'Pet Photo') => {
  return `https://via.placeholder.com/${width}x${height}/cccccc/666666?text=${encodeURIComponent(text)}`;
};

// Specific helpers for different image types
export const getPetImage = (petImagePath) => {
  return getImagePath(petImagePath, 'pet');
};

export const getProductImage = (productImagePath) => {
  return getImagePath(productImagePath, 'product');
};

export const getBrandImage = (brandImagePath) => {
  return getImagePath(brandImagePath, 'brand');
};

export const getAboutImage = (aboutImagePath) => {
  return getImagePath(aboutImagePath, 'about');
};

// Get image file extension
export const getImageExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

// Check if file extension is valid image
export const isValidImageExtension = (filename) => {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getImageExtension(filename);
  return validExtensions.includes(extension);
};