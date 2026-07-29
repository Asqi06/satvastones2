interface CloudinaryLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({ src, width, quality }: CloudinaryLoaderProps): string {
  if (src.startsWith("/") && !src.startsWith("//")) {
    return src;
  }

  if (src.includes("res.cloudinary.com")) {
    const params = [
      `w_${width}`,
      "c_limit",
      `q_${quality || "auto"}`,
      "f_auto",
    ].join(",");

    return src.replace("/upload/", `/upload/${params}/`);
  }

  return src;
}
