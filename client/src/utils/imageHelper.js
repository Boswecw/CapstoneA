// client/src/utils/imageHelper.js
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

// FIXED: Safe placeholder image generation that handles Unicode characters
export const getPlaceholderImage = (
  width = 400,
  height = 300,
  text = "Pet Photo",
) => {
  // Clean and sanitize the text to prevent btoa errors
  const cleanText = text
    .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters (emojis, etc.)
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters except spaces
    .trim() || "Pet Photo"; // Fallback if text becomes empty

  // Use URL encoding instead of btoa to avoid character encoding issues
  const encodedText = encodeURIComponent(cleanText);
  
  return `https://via.placeholder.com/${width}x${height}/f8f9fa/6c757d?text=${encodedText}`;
};

// Alternative method using a more robust placeholder service
export const getPlaceholderImageRobust = (
  width = 400,
  height = 300,
  text = "Pet Photo",
) => {
  // Use picsum.photos for more reliable placeholder images
  return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;
};

// Safe text-based placeholder that avoids encoding issues entirely
export const getTextPlaceholder = (
  width = 400,
  height = 300,
  text = "Pet Photo",
) => {
  // Create a simple colored placeholder without text to avoid encoding issues
  return `https://via.placeholder.com/${width}x${height}/e9ecef/495057`;
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

// Additional helper functions for better image handling
export const getImageWithFallback = (primarySrc, fallbackSrc, type = "pet") => {
  if (primarySrc) {
    return getImagePath(primarySrc, type);
  }
  return fallbackSrc || IMAGE_PATHS.placeholders[type];
};

export const createDataUrl = (width, height, backgroundColor = "#f8f9fa", textColor = "#6c757d") => {
  // Create a simple SVG placeholder to avoid encoding issues
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="${textColor}" font-family="Arial, sans-serif" font-size="14">
        Pet Photo
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};