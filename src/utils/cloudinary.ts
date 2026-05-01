/**
 * Optimizes a Cloudinary URL by adding auto-format and auto-quality.
 * If the URL is not from Cloudinary, it returns the original URL.
 */
export const optimizeImage = (url: string, width?: number, height?: number) => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  // Add transformations: f_auto (format), q_auto (quality)
  let transformation = 'f_auto,q_auto';
  if (width) transformation += `,w_${width}`;
  if (height) transformation += `,h_${height}`;

  return `${parts[0]}/upload/${transformation}/${parts[1]}`;
};

/**
 * Opens the Cloudinary Upload Widget.
 * Requires the script to be loaded in index.html.
 */
export const openUploadWidget = (callback: (url: string) => void) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset || cloudName === 'your_cloud_name') {
    alert("Please configure Cloudinary in your .env file first!");
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
