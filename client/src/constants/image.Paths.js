// client/src/constants/imagePaths.js
export const IMAGE_PATHS = {
  brand: {
    logo: '/images/brand/FurBabiesIcon.png',
    pawLove: '/images/brand/PawLoveicon.png'
  },
  products: {
    dogFood: '/images/products/Dogfood.png',
    catToy: '/images/products/interactivecattoy.png',
    aquarium: '/images/products/Aquarium.png',
    petBeds: '/images/products/PetBeds.png',
    petFood: '/images/products/PetFoodLPicon.png',
    guineaPigs: '/images/products/GuineaPigsLPicon.png'
  },
  about: {
    peopleCats: '/images/about/Peoplecats.png',
    missionVideo: '/images/about/mission-video-thumb.jpg'
  },
  placeholders: {
    pet: '/images/placeholders/pet-placeholder.png',
    product: '/images/placeholders/product-placeholder.png',
    brand: '/images/placeholders/brand-placeholder.png'
  }
};

// Helper functions for different image types
export const getPetImagePath = (filename) => {
  if (!filename) return IMAGE_PATHS.placeholders.pet;
  
  // If it's already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If it's a full path starting with /, return as is
  if (filename.startsWith('/')) {
    return filename;
  }
  
  // Otherwise, assume it's in the pets folder
  return `/images/pets/${filename}`;
};

export const getProductImagePath = (productKey) => {
  return IMAGE_PATHS.products[productKey] || IMAGE_PATHS.placeholders.product;
};

export const getBrandImagePath = (brandKey) => {
  return IMAGE_PATHS.brand[brandKey] || IMAGE_PATHS.placeholders.brand;
};

export const getAboutImagePath = (aboutKey) => {
  return IMAGE_PATHS.about[aboutKey] || IMAGE_PATHS.placeholders.brand;
};

