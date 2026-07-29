import type { ImageLoader } from "next/image";

const cloudinaryLoader: ImageLoader = ({ src, width, quality }) => {
  if (!src) return "";
  if (!src.includes("cloudinary.com")) return src;

  const parts = src.split("/upload/");
  if (parts.length !== 2) return src;

  const transforms = [
    "f_auto",
    "q_auto",
    `w_${width}`,
    "c_limit",
  ].join(",");

  return `${parts[0]}/upload/${transforms}/${parts[1]}`;
};

export default cloudinaryLoader;
