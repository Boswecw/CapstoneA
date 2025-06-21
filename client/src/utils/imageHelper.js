// client/src/utils/imageHelper.js

// Helper function to get the correct image path
export const getImagePath = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a local file path starting with /, return as is
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // If it's just a filename, assume it's in public/images/pets/
  return `/images/pets/${imagePath}`;
};

// Helper to validate image URL
export const validateImageUrl = async (url) => {
  if (!url) return false;
  
  try {
    // Create a new image element to test loading
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 10 seconds
      setTimeout(() => resolve(false), 10000);
    });
  } catch (error) {
    return false;
  }
};

// Get image file extension
export const getImageExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Check if file extension is valid image
export const isValidImageExtension = (filename) => {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getImageExtension(filename);
  return validExtensions.includes(extension);
};

// Generate placeholder image URL
export const getPlaceholderImage = (width = 400, height = 300, text = 'Pet Photo') => {
  return `https://via.placeholder.com/${width}x${height}/cccccc/666666?text=${encodeURIComponent(text)}`;
};