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
 * Optimizes a Cloudinary URL by forcing WebP/AVIF auto-format, good quality, and optional sizing.
 * Uses q_auto:good (vs best) for significantly smaller files with negligible visible quality loss.
 * Falls back to original URL for non-Cloudinary images.
 */
export const optimizeImage = (url: string, width?: number, height?: number) => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;

  // f_auto picks WebP/AVIF automatically, q_auto:good is ~60-70% quality — ideal for web
  let transforms = 'f_auto,q_auto:good';

  if (width && height) {
    transforms += `,c_fill,g_auto:face,w_${width},h_${height}`;
  } else if (width) {
    transforms += `,c_limit,w_${width}`;
  } else if (height) {
    transforms += `,c_limit,h_${height}`;
  }

  return buildUrl(url, transforms);
};

/**
 * Generates a srcSet string for responsive images at multiple breakpoints.
 * Uses f_auto for format detection and q_auto:good for balanced quality/size.
 */
export const getSrcSet = (url: string, widths: number[] = [320, 480, 768, 1024, 1280]): string => {
  if (!url || !url.includes('cloudinary.com')) return '';
  return widths
    .map(w => `${buildUrl(url, `f_auto,q_auto:good,c_limit,w_${w}`)} ${w}w`)
    .join(', ');
};

/**
 * Returns a low-quality placeholder (blurred thumbnail) for progressive loading.
 */
export const getPlaceholder = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return '';
  return buildUrl(url, 'f_auto,q_1,w_20,e_blur:400');
};

/**
 * Opens the Cloudinary Upload Widget.
 * Requires the script to be loaded in index.html.
 */
export const openUploadWidget = (callback: (url: string) => void, config?: { cloudName?: string, uploadPreset?: string }) => {
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
      cropping: true,
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
