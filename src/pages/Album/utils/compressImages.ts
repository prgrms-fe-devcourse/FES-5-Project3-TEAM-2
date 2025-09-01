import imageCompression from "browser-image-compression";

export const compressImages = async (files: File[]): Promise<File[]> => {
  return Promise.all(
    files.map(async (file) => {
      try {
        return await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8,
        });
      } catch (error) {
        console.error("이미지 압축 실패:", error);
        return file;
      }
    }),
  );
};
