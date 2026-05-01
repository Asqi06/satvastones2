import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: string, folder: string = "satvastones") {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    transformation: [
      { width: 800, height: 800, crop: "limit", quality: "auto" },
    ],
  });
  return result.secure_url;
}

export async function deleteFromCloudinary(url: string) {
  const publicId = url.split("/").slice(-2).join("/").split(".")[0];
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
