import { uploadFileToStorage } from "@/api/uploadStorage";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useRef, useState } from "react";

// album-photos 타입
type AlbumFile = {
  name: string;     // 파일명
  path: string;     // prefix/파일명
  url: string;      // public url
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (publicUrl: string) => void;
  groupId: string; // 그룹 기준
  bucket?: string;
  albumPrefix?: string; // album = groups/{groupId}/album
  uploadPrefix?: string; // groups/{groupId}/covers
};

export default function AlbumPickModal({
  open,
  onClose,
  onSelect,
  groupId,
  bucket = "album-photos",
  albumPrefix,
  uploadPrefix,
}: Props) {
  const [tab, setTab] = useState<"album" | "upload">("album");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<AlbumFile[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const ALBUM_PREFIX = albumPrefix ?? `${groupId}`;

  const UPLOAD_PREFIX =
  uploadPrefix ?? `groups/${groupId}/covers`;

  const pickedFile = useMemo(
    () => files.find((f) => f.url === picked) ?? null,
    [files, picked]
  );

  // Album 탭: 앨범 폴더만 나열
  useEffect(() => {
  if (!open) return;

  setTab("album");
  setPicked(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // Supabase에서 해당 prefix 안의 파일 목록 가져오기
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(ALBUM_PREFIX, {
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      // 이미지 파일만 가져오기
      const images = (data ?? []).filter((file) =>
        /\.(png|jpe?g|gif)$/i.test(file.name)
      );

      // 각 파일에 대해 public URL 만들기
      const list: AlbumFile[] = images.map((file) => {
        const path = `${ALBUM_PREFIX}/${file.name}`;
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
        return {
          name: file.name,
          path,
          url: pub.publicUrl,
        };
      });

      setFiles(list);
    } finally {
      setLoading(false);
    }
  };

  fetchFiles();
}, [open, ALBUM_PREFIX, bucket]);




  if (!open) return null;

  const applyPick = async () => {
    if (!pickedFile) return;

    await supabase
    .from('groups')
    .update({
      bg_url: pickedFile.url,
    })
    .eq('id', groupId);

    onSelect(pickedFile.url);
    onClose();
  };

  // Upload 탭: covers 폴더로만 업로드 : Album 목록에는 포함시키지 않음
  const onUpload = async (file: File) => {
    const safe = file.name.replace(/\s+/g, "_");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const key = `${UPLOAD_PREFIX}/${stamp}__${safe}`;

    const publicUrl = await uploadFileToStorage(bucket, file, key);

    await supabase
    .from('groups')
    .update({
      bg_url: publicUrl,
    })
    .eq('id', groupId);

    // 업로드 직후 바로 적용
    onSelect(publicUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[780px] max-w-[95vw] rounded-xl bg-white p-5 shadow-xl"
      >
        <h3 className="mb-4 text-lg font-bold">배경 이미지 선택</h3>

        {/* 앨범 / 업로드 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={`rounded-lg border-0 px-3 py-1 cursor-pointer ${tab === "album" ? "bg-tertiary" : ""}`}
            onClick={() => setTab("album")}
          >
            앨범
          </button>
          <button
            type="button"
            className={`rounded-lg border-0 px-3 py-1 cursor-pointer ${tab === "upload" ? "bg-tertiary" : ""}`}
            onClick={() => setTab("upload")}
          >
            업로드
          </button>
        </div>

        {/* 앨범 탭 */}
        {tab === "album" ? (
          loading ? (
            <div className="py-10 text-center text-sm text-slate-500">사진 불러오는 중...</div>
          ) : files.length === 0 ? (
            <div className="flex flex-col py-10 text-center text-sm text-slate-500">
              그룹 앨범에 사진이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-2 max-h-[60vh] overflow-y-auto">
              {files.map((f) => {
                const selected = picked === f.url;
                return (
                  <button
                    key={f.path}
                    type="button"
                    className={`relative aspect-[20/9] rounded-lg overflow-hidden cursor-pointer border ${selected ? "ring-2 ring-tertiary border-transparent" : "border-slate-200"}`}
                    onClick={() => setPicked(f.url)}
                    title={f.name}
                  >
                    <img src={f.url} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                    {selected && (
                      <span className="absolute right-2 top-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">선택됨</span>
                    )}
                  </button>
                );
              })}
            </div>
          )
        ) : (   /* 업로드 탭 */
          <div className="py-8 mb-4 flex flex-col items-center text-center">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-primary px-4 py-2 mb-3 font-semibold text-white cursor-pointer"
            >
              이미지 파일 선택
            </button>
            <p className="mt-2 text-sm text-tertiary">JPG/PNG 등 이미지 파일을 업로드하세요.</p>
          </div>
        )}

        {/* 하단 버튼 */}
        {tab === "album" && (
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 cursor-pointer">취소</button>
            <button
              type="button"
              disabled={!pickedFile}
              onClick={applyPick}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60 cursor-pointer"
            >
              저장
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
