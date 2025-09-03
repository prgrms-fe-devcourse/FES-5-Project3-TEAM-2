

// Public URL에서 storage key(path)만 추출
// groups/123/covers/abc.png

export function extractStorageKeyFromPublicUrl(
  publicUrl: string,
  bucket: string,
): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const key = publicUrl.slice(idx + marker.length);
  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
}


// Public URL이 특정 그룹의 covers 경로인지 여부
// groups/${groupId}/covers/

export function isGroupCoverUrl(
  publicUrl: string,
  bucket: string,
  groupId: string,
): boolean {
  const key = extractStorageKeyFromPublicUrl(publicUrl, bucket);
  return !!key && key.startsWith(`groups/${groupId}/covers/`);
}
