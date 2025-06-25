const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CloudStorageService {
  constructor() {
    this.storage = new Storage({
      keyFilename: path.join(__dirname, 'google-cloud-storage-key.json'),
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
    
    this.bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    this.bucket = this.storage.bucket(this.bucketName);
  }

  // Upload image to Cloud Storage
  async uploadImage(fileBuffer, originalName, folder = 'pets', petId = null) {
    try {
      const fileExtension = path.extname(originalName);
      const uniqueId = uuidv4();
      const timestamp = Date.now();
      
      // Create unique filename
      const fileName = petId 
        ? `${folder}/${petId}-${timestamp}-${uniqueId}${fileExtension}`
        : `${folder}/${timestamp}-${uniqueId}${fileExtension}`;

      const file = this.bucket.file(fileName);
      
      // Upload options
      const options = {
        metadata: {
          contentType: this.getContentType(fileExtension),
          metadata: {
            originalName: originalName,
            uploadedAt: new Date().toISOString(),
            petId: petId || 'unknown',
            folder: folder
          }
        },
        resumable: false, // Use simple upload for files < 5MB
      };

      // Upload the file
      await file.save(fileBuffer, options);

      // Make file publicly accessible
      await file.makePublic();

      // Return file information
      return {
        fileName: fileName,
        originalName: originalName,
        publicUrl: `https://storage.googleapis.com/${this.bucketName}/${fileName}`,
        gsUrl: `gs://${this.bucketName}/${fileName}`,
        bucketName: this.bucketName,
        size: fileBuffer.length,
        contentType: this.getContentType(fileExtension),
        uploadDate: new Date()
      };

    } catch (error) {
      console.error('Cloud Storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // Generate thumbnail
  async uploadThumbnail(imageBuffer, originalFileName, folder = 'thumbnails') {
    try {
      const sharp = require('sharp');
      
      // Resize image to thumbnail
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const result = await this.uploadImage(
        thumbnailBuffer, 
        `thumb-${originalFileName}`, 
        folder
      );

      return result;
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      throw error;
    }
  }

  // Delete image from bucket
  async deleteImage(fileName) {
    try {
      await this.bucket.file(fileName).delete();
      return { success: true, message: 'Image deleted successfully' };
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  // Get image metadata
  async getImageMetadata(fileName) {
    try {
      const file = this.bucket.file(fileName);
      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error) {
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  // List images in folder
  async listImages(folder = '', maxResults = 100) {
    try {
      const [files] = await this.bucket.getFiles({
        prefix: folder,
        maxResults: maxResults,
      });

      return files.map(file => ({
        name: file.name,
        publicUrl: `https://storage.googleapis.com/${this.bucketName}/${file.name}`,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        timeCreated: file.metadata.timeCreated,
        updated: file.metadata.updated
      }));
    } catch (error) {
      throw new Error(`Failed to list images: ${error.message}`);
    }
  }

  // Generate signed URL for temporary access
  async generateSignedUrl(fileName, expirationMinutes = 60) {
    try {
      const file = this.bucket.file(fileName);
      
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expirationMinutes * 60 * 1000,
      });

      return url;
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  // Helper method to determine content type
  getContentType(fileExtension) {
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return contentTypes[fileExtension.toLowerCase()] || 'image/jpeg';
  }

  // Batch upload multiple images
  async uploadMultipleImages(files, folder = 'pets', petId = null) {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage(
          file.buffer, 
          file.originalname, 
          folder, 
          petId
        );
        results.push(result);
      } catch (error) {
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    return { results, errors };
  }
}

module.exports = CloudStorageService;