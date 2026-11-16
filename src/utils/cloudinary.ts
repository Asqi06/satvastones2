/**
 * Cloudinary Optimization & Upload Utility for Satvastones Jewellery
 */

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
}

/**
 * Automatically transforms Cloudinary URLs with auto-format (f_auto),
 * auto-compression (q_auto), and optional resizing for blazing fast load speeds.
 */
export function optimizeCloudinaryUrl(url: string, options: CloudinaryOptions = {}): string {
  if (!url || typeof url !== 'string') return url;

  // Only transform if it's a Cloudinary asset
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  const transformations: string[] = [`f_${format}`, `q_${quality}`];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  const transformString = transformations.join(',');

  // Check if URL already has /upload/
  if (url.includes('/upload/')) {
    // Avoid double transformations
    if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto')) {
      return url;
    }
    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  return url;
}

/**
 * Open the official Cloudinary Upload Widget
 */
export function openCloudinaryWidget(
  cloudName: string,
  uploadPreset: string,
  onSuccess: (url: string) => void,
  onError?: (error: any) => void
): void {
  if (typeof window === 'undefined') return;

  // Check if Cloudinary script is loaded
  const cloudinaryWindow = window as any;
  if (!cloudinaryWindow.cloudinary || !cloudinaryWindow.cloudinary.createUploadWidget) {
    alert('Cloudinary Upload Widget is still loading. Please check your connection or paste your image URL directly.');
    return;
  }

  if (!cloudName || !uploadPreset || cloudName.includes('your-cloud') || uploadPreset.includes('your-preset')) {
    const inputCloud = prompt('Enter your Cloudinary Cloud Name:', cloudName || '');
    if (!inputCloud) return;
    const inputPreset = prompt('Enter your Cloudinary Upload Preset:', uploadPreset || '');
    if (!inputPreset) return;
    cloudName = inputCloud.trim();
    uploadPreset = inputPreset.trim();
  }

  try {
    const widget = cloudinaryWindow.cloudinary.createUploadWidget(
      {
        cloudName: cloudName.trim(),
        uploadPreset: uploadPreset.trim(),
        sources: ['local', 'url', 'camera', 'unsplash'],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 0.75, // 3:4 portrait luxury ratio
        showSkipCropButton: true,
        resourceType: 'image',
        folder: 'satvastones_catalog',
        theme: 'minimal',
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'avif'],
        maxFileSize: 10000000 // 10MB
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          const secureUrl = result.info.secure_url;
          onSuccess(secureUrl);
        } else if (error) {
          if (onError) onError(error);
          else console.error('Cloudinary upload error:', error);
        }
      }
    );

    widget.open();
  } catch (err) {
    console.error('Failed to open Cloudinary widget:', err);
    alert('Could not initialize Cloudinary Widget. Please verify your Cloud Name and Preset in Admin Settings.');
  }
}
