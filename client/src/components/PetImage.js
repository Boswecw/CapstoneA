// client/src/components/PetImage.js
import React, { useState } from 'react';
import { getImagePath, getPlaceholderImage } from '../utils/imageHelper';
import './PetImage.css';

const PetImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackText = 'Pet Photo',
  width = 300,
  height = 200,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // Get the processed image path
  const imageSrc = getImagePath(src);
  
  // Use placeholder if no image or error
  const finalSrc = imageError || !imageSrc 
    ? getPlaceholderImage(width, height, fallbackText)
    : imageSrc;

  return (
    <div className={`pet-image-container ${className}`} {...props}>
      {isLoading && !imageError && (
        <div className="image-loading">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      )}
      
      <img
        src={finalSrc}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`pet-image ${isLoading ? 'loading' : ''} ${imageError ? 'error' : ''}`}
      />
      
      {imageError && src && (
        <div className="image-error-overlay">
          <span>📷</span>
          <p>Image not available</p>
          <small>Using placeholder</small>
        </div>
      )}
    </div>
  );
};

export default PetImage;