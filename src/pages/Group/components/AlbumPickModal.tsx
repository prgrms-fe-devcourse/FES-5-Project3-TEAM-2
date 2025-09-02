import { uploadFileToStorage } from "@/api/uploadStorage";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useRef, useState } from "react";


type AlbumFile = {
  name: string; // 파일명
  path: string; // userId/파일명
  url: string;  // public url
};

type Props = {
  open: boolean;
  userId: string;
  onClose: () => void;
  onSelect: (publicUrl: string) => void;
  bucket?: string;
};

export default function AlbumPickerModal({
  open,
  userId,
  onClose,
  onSelect,
  bucket = "album",
}: Props) {
  const [tab, setTab] = useState<"album" | "upload">("album");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<AlbumFile[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pickedFile = useMemo(
    () => files.find((f) => f.url === picked),
    [files, picked]
  );

  // 열릴 때 앨범 로드
  useEffect(() => {
    if (!open) return;
    setTab("album");
    setPicked(null);

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .list(`${userId}`, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
        if (error) throw error;

        const list: AlbumFile[] = (data ?? [])
          .filter((f) => (f.metadata as any)?.mimetype?.startsWith?.("image/"))
          .map((f) => {
            const path = `${userId}/${f.name}`;
            const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
            return { name: f.name, path, url: pub.publicUrl };
          });

        setFiles(list);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, userId, bucket]);

  if (!open) return null;

  const applyPick = () => {
    if (!pickedFile) return;
    onSelect(pickedFile.url);
  };

  const onUpload = async (file: File) => {
    const safe = file.name.replace(/\s+/g, "_");
    const key = `${userId}/${Date.now()}_${safe}`; // 정책: userId/...
    const publicUrl = await uploadFileToStorage(bucket, file, key);

    const newItem: AlbumFile = { name: safe, path: key, url: publicUrl };
    setFiles((prev) => [newItem, ...prev]);
    setTab("album");
    setPicked(publicUrl);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[780px] max-w-[95vw] rounded-xl bg-white p-5 shadow-xl"
        role="dialog" aria-modal="true" aria-labelledby="album-picker-title"
      >
        <h3 id="album-picker-title" className="mb-4 text-lg font-bold">배경 이미지 선택</h3>

        <div className="mb-4 flex gap-2">
          <button type="button" className={`rounded-lg border px-3 py-1 ${tab === "album" ? "bg-slate-100" : ""}`} onClick={() => setTab("album")}>앨범</button>
          <button type="button" className={`rounded-lg border px-3 py-1 ${tab === "upload" ? "bg-slate-100" : ""}`} onClick={() => setTab("upload")}>업로드</button>
        </div>

        {tab === "album" ? (
          loading ? (
            <div className="py-10 text-center text-sm text-slate-500">로딩 중…</div>
          ) : files.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              앨범에 이미지가 없어요.{" "}
              <button type="button" className="underline text-tertiary" onClick={() => setTab("upload")}>지금 업로드하기</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
              {files.map((f) => {
                const selected = picked === f.url;
                return (
                  <button
                    key={f.path}
                    type="button"
                    className={`relative aspect-[20/9] rounded-lg overflow-hidden border ${selected ? "ring-2 ring-tertiary border-transparent" : "border-slate-200"}`}
                    onClick={() => setPicked(f.url)}
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
        ) : (
          <div className="py-8 text-center">
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
            <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-primary px-4 py-2 font-semibold text-white cursor-pointer">
              이미지 파일 선택
            </button>
            <p className="mt-2 text-xs text-slate-500">JPG/PNG 등 이미지 파일을 업로드하세요.</p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 cursor-pointer">취소</button>
          <button type="button" disabled={!pickedFile} onClick={applyPick} className="rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60 cursor-pointer">적용</button>
        </div>
      </div>
    </div>
  );
}
