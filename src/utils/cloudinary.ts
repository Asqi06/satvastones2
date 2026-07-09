/**
 * Extracts the public ID from a Cloudinary URL.
 */
const getPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
};

/**
 * Builds a Cloudinary URL with the given transformations.
 * Preserves version number and original extension for proper cache behavior.
 */
const buildUrl = (url: string, transforms: string): string => {
  if (!url.includes('cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  return `${parts[0]}/upload/${transforms}/${parts[1]}`;
};

/**
 * Optimizes an image URL (Cloudinary or Unsplash) by forcing format/quality optimization and optional sizing.
 * Uses q_auto:eco for Cloudinary and q=60 for Unsplash to achieve maximum compression with great visual quality.
 */
export const optimizeImage = (url: string, width?: number, height?: number) => {
  if (!url) return '';

  if (url.includes('cloudinary.com')) {
    // f_auto picks WebP/AVIF automatically, q_auto:eco is optimized for web performance
    let transforms = 'f_auto,q_auto:eco';

    if (width && height) {
      transforms += `,c_fill,g_auto:face,w_${width},h_${height}`;
    } else if (width) {
      transforms += `,c_limit,w_${width}`;
    } else if (height) {
      transforms += `,c_limit,h_${height}`;
    }

    return buildUrl(url, transforms);
  }

  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('q', '60'); // Eco quality
      if (width) parsedUrl.searchParams.set('w', width.toString());
      if (height) parsedUrl.searchParams.set('h', height.toString());
      if (width && height) parsedUrl.searchParams.set('fit', 'crop');
      return parsedUrl.toString();
    } catch (e) {
      return url;
    }
  }

  return url;
};

/**
 * Generates a srcSet string for responsive images at multiple breakpoints.
 * Supports Cloudinary and Unsplash, with an optional aspect ratio (height / width) to ensure proper cropping.
 */
export const getSrcSet = (url: string, widths: number[] = [320, 480, 768, 1024, 1280], aspectRatio?: number): string => {
  if (!url) return '';

  if (url.includes('cloudinary.com')) {
    return widths
      .map(w => {
        let transforms = `f_auto,q_auto:eco`;
        if (aspectRatio) {
          const h = Math.round(w * aspectRatio);
          transforms += `,c_fill,g_auto:face,w_${w},h_${h}`;
        } else {
          transforms += `,c_limit,w_${w}`;
        }
        return `${buildUrl(url, transforms)} ${w}w`;
      })
      .join(', ');
  }

  if (url.includes('images.unsplash.com')) {
    return widths
      .map(w => {
        try {
          const parsedUrl = new URL(url);
          parsedUrl.searchParams.set('auto', 'format');
          parsedUrl.searchParams.set('q', '60');
          parsedUrl.searchParams.set('w', w.toString());
          if (aspectRatio) {
            const h = Math.round(w * aspectRatio);
            parsedUrl.searchParams.set('h', h.toString());
            parsedUrl.searchParams.set('fit', 'crop');
          }
          return `${parsedUrl.toString()} ${w}w`;
        } catch (e) {
          return `${url} ${w}w`;
        }
      })
      .join(', ');
  }

  return '';
};

/**
 * Returns a low-quality placeholder (blurred thumbnail) for progressive loading.
 */
export const getPlaceholder = (url: string): string => {
  if (!url) return '';
  if (url.includes('cloudinary.com')) {
    return buildUrl(url, 'f_auto,q_1,w_20,e_blur:400');
  }
  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('w', '20');
      parsedUrl.searchParams.set('q', '10');
      parsedUrl.searchParams.set('blur', '10');
      return parsedUrl.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
};

/**
 * Opens the Cloudinary Upload Widget.
 * Requires the script to be loaded in index.html.
 */
export const openUploadWidget = (callback: (url: string) => void, config?: { cloudName?: string, uploadPreset?: string }, resourceType: 'image' | 'video' = 'image') => {
  const cloudName = config?.cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = config?.uploadPreset || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset || cloudName === 'your_cloud_name') {
    const missing = [];
    if (!cloudName || cloudName === 'your_cloud_name') missing.push("VITE_CLOUDINARY_CLOUD_NAME");
    if (!uploadPreset) missing.push("VITE_CLOUDINARY_UPLOAD_PRESET");
    
    alert(`Image Upload Error: Missing ${missing.join(" and ")}. \n\nPlease go to Admin -> Settings and enter your Cloudinary details there!`);
    return;
  }

  // @ts-ignore
  const widget = window.cloudinary.createUploadWidget(
    {
      cloudName: cloudName,
      uploadPreset: uploadPreset,
      sources: ['local', 'url', 'camera'],
      multiple: false,
      resourceType: resourceType,
      cropping: resourceType === 'image',
      styles: {
        palette: {
          window: "#FFFFFF",
          windowBorder: "#90A0B3",
          tabIcon: "#000000",
          menuIcons: "#5A616A",
          textDark: "#000000",
          textLight: "#FFFFFF",
          link: "#000000",
          action: "#000000",
          inactiveTabIcon: "#0E2F5A",
          error: "#F44235",
          inProgress: "#0078FF",
          complete: "#20B832",
          sourceBg: "#E4EBF1"
        },
      }
    },
    (error: any, result: any) => {
      if (!error && result && result.event === "success") {
        callback(result.info.secure_url);
      }
    }
  );
  widget.open();
};
