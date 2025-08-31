export function extractFileNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    const bucketPath = pathname.split("/album-photos/")[1];
    return bucketPath || null;
  } catch (error) {
    console.error("파일명 추출 실패:", error);
    return null;
  }
}
