import { toast } from "@/components/Sweetalert";

export function extractFileNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    const bucketPath = pathname.split("/album-photos/")[1];
    return bucketPath || null;
  } catch (error) {
    toast({
      title: "파일명을 추출하지 못했습니다.",
      icon: "error",
      position: "top",
    });
    return null;
  }
}
