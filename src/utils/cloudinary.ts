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
 * Direct REST API upload to Cloudinary (Bypasses iframes completely)
 * This guarantees 100% upload reliability without being affected by
 * browser adblockers, iframe CSP restrictions, or widget crashes.
 */
export async function uploadToCloudinaryDirect(
  file: File | Blob,
  cloudName: string,
  uploadPreset: string,
  folder = 'satvastones_catalog'
): Promise<string> {
  const cleanCloud = cloudName.trim();
  const cleanPreset = uploadPreset.trim();

  if (!cleanCloud || !cleanPreset) {
    throw new Error('Cloudinary Cloud Name and Upload Preset are required in Admin Settings.');
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cleanCloud}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cleanPreset);
  if (folder) {
    formData.append('folder', folder);
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    const data = await res.json() as any;

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `HTTP ${res.status}: Failed to upload to Cloudinary`;
      
      // Provide actionable guidance for common Cloudinary configuration mistakes
      if (errMsg.toLowerCase().includes('must be unsigned') || errMsg.toLowerCase().includes('whitelisted')) {
        throw new Error(
          `Cloudinary Error: Your upload preset "${cleanPreset}" is set to "Signed". In your Cloudinary Console, go to Settings (gear icon) → Upload → Upload Presets, edit "${cleanPreset}", and set Signing Mode to "Unsigned".`
        );
      }
      if (errMsg.toLowerCase().includes('cloud not found') || errMsg.toLowerCase().includes('disabled')) {
        throw new Error(
          `Cloudinary Error: Cloud Name "${cleanCloud}" not found or disabled. Please verify the exact spelling in your Cloudinary Dashboard.`
        );
      }
      if (errMsg.toLowerCase().includes('preset not found')) {
        throw new Error(
          `Cloudinary Error: Upload Preset "${cleanPreset}" not found in cloud "${cleanCloud}". Please verify the preset name in Cloudinary Settings → Upload.`
        );
      }

      throw new Error(`Cloudinary Error: ${errMsg}`);
    }

    return data.secure_url;
  } catch (err: any) {
    console.error('Cloudinary Direct Upload Failed:', err);
    throw err;
  }
}

/**
 * Test Cloudinary Connection & Preset Validity
 * Uploads a microscopic 1x1 test pixel to verify cloud name and unsigned preset
 */
export async function testCloudinaryConnection(
  cloudName: string,
  uploadPreset: string
): Promise<{ success: boolean; message: string; url?: string }> {
  try {
    // 1x1 transparent PNG data URI
    const pixelBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const blob = await (await fetch(pixelBase64)).blob();
    const uploadedUrl = await uploadToCloudinaryDirect(blob, cloudName, uploadPreset, 'satvastones_test');

    return {
      success: true,
      message: `Connection successful! Cloud "${cloudName}" and unsigned preset "${uploadPreset}" are working perfectly.`,
      url: uploadedUrl
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Connection test failed. Please verify your Cloud Name and Preset.'
    };
  }
}

/**
 * Open the official Cloudinary Upload Widget with automatic Direct File Picker Fallback
 */
export function openCloudinaryWidget(
  cloudName: string,
  uploadPreset: string,
  onSuccess: (url: string) => void,
  onError?: (error: any) => void
): void {
  if (typeof window === 'undefined') return;

  if (!cloudName || !uploadPreset || cloudName.includes('your-cloud') || uploadPreset.includes('your-preset')) {
    const inputCloud = prompt('Enter your Cloudinary Cloud Name:', cloudName || '');
    if (!inputCloud) return;
    const inputPreset = prompt('Enter your Cloudinary Upload Preset (Unsigned):', uploadPreset || '');
    if (!inputPreset) return;
    cloudName = inputCloud.trim();
    uploadPreset = inputPreset.trim();
  }

  // Native File Picker Fallback Function
  const openDirectFilePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/avif,image/gif';
    input.style.display = 'none';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const progressToast = document.createElement('div');
      progressToast.className = 'fixed bottom-6 right-6 z-50 bg-[#111111] text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-2';
      progressToast.innerHTML = `
        <svg class="animate-spin h-4 w-4 text-[#8d3f3d]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>Uploading <strong>${file.name}</strong> directly to Cloudinary...</span>
      `;
      document.body.appendChild(progressToast);

      try {
        const secureUrl = await uploadToCloudinaryDirect(file, cloudName, uploadPreset);
        progressToast.className = 'fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-700';
        progressToast.innerHTML = `<span>✓ Uploaded to Cloudinary successfully!</span>`;
        setTimeout(() => progressToast.remove(), 2500);
        onSuccess(secureUrl);
      } catch (err: any) {
        progressToast.remove();
        alert(err.message || 'Direct upload to Cloudinary failed.');
        if (onError) onError(err);
      } finally {
        input.remove();
      }
    };

    document.body.appendChild(input);
    input.click();
  };

  // Check if Cloudinary script is available and not blocked by browser extension
  const cloudinaryWindow = window as any;
  if (!cloudinaryWindow.cloudinary || !cloudinaryWindow.cloudinary.createUploadWidget) {
    // If the widget script is blocked by an adblocker/browser security, fall back smoothly to direct file upload!
    openDirectFilePicker();
    return;
  }

  try {
    const widget = cloudinaryWindow.cloudinary.createUploadWidget(
      {
        cloudName: cloudName.trim(),
        uploadPreset: uploadPreset.trim(),
        sources: ['local', 'url', 'camera', 'unsplash'],
        multiple: false,
        cropping: false, // Disabling iframe cropping prevents cross-origin canvas errors & grey screens
        showSkipCropButton: true,
        resourceType: 'image',
        folder: 'satvastones_catalog',
        theme: 'minimal',
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif'],
        maxFileSize: 15000000 // 15MB
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          const secureUrl = result.info.secure_url;
          onSuccess(secureUrl);
        } else if (error) {
          console.error('Cloudinary upload widget error:', error);
          if (onError) onError(error);
          // If widget iframe has an error or is blocked, offer direct file picker fallback
          if (confirm('The widget encountered a browser restriction. Would you like to select and upload your file directly instead?')) {
            openDirectFilePicker();
          }
        }
      }
    );

    widget.open();
  } catch (err) {
    console.warn('Failed to open Cloudinary widget, falling back to direct upload:', err);
    openDirectFilePicker();
  }
}
