import cardbg from "@/assets/cardbg.png";
import edit from "@/assets/icons/cardedit.svg";
import { confirmDialog, errorAlert, toast } from "@/components/Sweetalert";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/types/supabase";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";

type Props = {
  g: Tables<"groups">;
  openMenuId?: string | null;
  setOpenMenuId?: (id:string | null) => void;
  onDelete: (id:string) => Promise<void> | void;
  onUpdated?: (patch: { id: string; name?: string; start_day?: string; end_day?: string }) => void;
}

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${y.slice(2)}.${m}.${d}`;
};

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function GroupCard({ g, openMenuId, setOpenMenuId, onDelete, onUpdated }: Props) {

  const navigate = useNavigate();
  const {userId} = useParams<{userId:string}>();

  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(g.name);
  const [startISO, setStartISO] = useState(g.start_day ?? toISO(new Date()));
  const [endISO, setEndISO] = useState(g.end_day ?? toISO(new Date()));

  const menuOpen = openMenuId === g.id;

  const openDashboard = () => {
    navigate(`/groups/${userId}/g/${g.id}`);
  }

  const validateEdit = () => {
  if (!name.trim()) return "그룹명을 입력해주세요.";
  if (!startISO || !endISO) return "시작일과 종료일을 모두 선택해 주세요.";
  if (startISO > endISO) return "종료일은 시작일 이후여야 합니다.";
  return null;
};

  const handleCardClick = (e:React.MouseEvent) => {
    if(editOpen || menuOpen){
      e.stopPropagation();
      setOpenMenuId?.(null);
      return;
    }
    openDashboard();
  }

  const copyInvite = async (e:React.MouseEvent) => {
    e.stopPropagation();

    const url = `${window.location.origin}/g/${g.id}`;

      // 모바일/지원 브라우저
      if(navigator.share){
        await navigator.share({title:'그룹 초대', url});
        return;
      }

      // Clipboard API
      await navigator.clipboard.writeText(url);
    }

  const onEditClick = (e:React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId?.(menuOpen ? null : g.id);
  };

  const isOwnerPromise = async() => {
    const {data:{user}} = await supabase.auth.getUser();
    return user?.id === g.owner_id;
  }

  const handleDelete = async (e:React.MouseEvent) => {
    e.stopPropagation();

    const isOwner = await isOwnerPromise();
    if(!isOwner) {
      await errorAlert({title:'삭제 권한 없음', text:'그룹 삭제 권한이 없습니다.'})
      setOpenMenuId?.(null);
      return;
    }

    try{
    const ok = await confirmDialog({ title: "정말 삭제하시겠습니까?", text: "삭제된 그룹은 되돌릴 수 없습니다.", icon: "warning", confirmButtonText: "삭제", cancelButtonText: "취소" });
    if (!ok) return;
      await onDelete(g.id);
      Swal.close();
      await toast({ title: "삭제가 완료되었습니다.", icon: "success", position: "top" });
    } catch (err) {
      await errorAlert({ title: "삭제 실패", text: "다시 시도해주세요." });
    } finally {
      setOpenMenuId?.(null);
    }
  }

  const openEditInfo = async (e:React.MouseEvent) => {
    e.stopPropagation();

    // 기존값 초기화 후 모달 열기
    setName(g.name);
    setStartISO(g.start_day ?? toISO(new Date()));
    setEndISO(g.end_day ?? toISO(new Date()));
    setEditError(null);
    setSaving(false);
    setEditOpen(true);
    setOpenMenuId?.(null);
  }

  const saveEditInfo = async () => {
  const msg = validateEdit();
  if (msg) { setEditError(msg); return; }

  // 모달창 먼저 닫기
  setEditOpen(false);
  setSaving(true);

  try {
    setSaving(true);
    const { error } = await supabase
      .from("groups")
      .update({ name, start_day: startISO, end_day: endISO })
      .eq("id", g.id);
    if (error) throw error;

    onUpdated?.({ id: g.id, name, start_day: startISO, end_day: endISO });
    await toast({ title: "그룹 정보가 수정되었습니다.", icon: "success", position: "top" });



    setEditOpen(false);
  } catch {
    await errorAlert({ title: "수정 실패", text: "다시 시도해주세요." });
  } finally {
    setSaving(false);
  }
};

  return (
    <div
    onClick={handleCardClick}
    className="w-full max-w-[480px] bg-white rounded-2xl cursor-pointer shadow-[4px_4px_4px_rgba(0,0,0,0.25)]">
      <div className="relative aspect-[20/9] w-full">
          <img src={cardbg} alt="배경이미지" className="h-full w-full object-cover rounded-t-2xl" />
          <h3 className="absolute px-2 mr-20 left-5 top-5 text-7 font-extrabold text-white">
            {g.name}
          </h3>

          <div className="absolute right-4 top-4">
            <button
            type="button"
            onClick={onEditClick}
            className="px-4 py-3 hover:bg-gray-50/50 hover:px-4 rounded-3xl cursor-pointer"
          >
            <img src={edit} alt="카드 편집 버튼" />
          </button>

          {menuOpen && (
            <div
            onClick={(e)=>e.stopPropagation()}
            className="absolute right-0 mt-2 w-36 rounded-2xl bg-white z-20 overflow-hidden"
            >
              <button
              type="button"
              className="w-full px-4 py-3 text-center text-sm hover:bg-fourth  hover:text-tertiary transition cursor-pointer"
              onClick={openEditInfo}
              >
                그룹 정보 수정
              </button>


              <button
              type="button"
              className="w-full px-4 py-3 text-center text-sm hover:bg-fourth hover:text-tertiary transition cursor-pointer"
              onClick={(e)=>{
                e.stopPropagation();
                setOpenMenuId?.(null);
              }}
              >
                배경 이미지 수정
              </button>

              <button
              type="button"
              className="w-full px-4 py-3 text-center text-sm hover:bg-fourth hover:text-tertiary transition cursor-pointer"
              onClick={handleDelete}
              >
                그룹 삭제
              </button>
            </div>
          )}
          </div>
        </div>

      <div className="flex items-center justify-between px-6 h-14 py-3 rounded-b-2xl">
        <p className="text-1">
          {formatDate(g.start_day)} ~ {formatDate(g.end_day)}
        </p>
        <button
          type="button"
          onClick={copyInvite}
          className="text-1 text-white bg-tertiary px-3 py-2 rounded-4xl cursor-pointer hover:bg-fourth hover:text-tertiary transition"
        >
          초대링크 복사
        </button>
      </div>

      {/* 그룹 정보 수정 모달 */}
      {editOpen && (
      <div
      className="fixed inset-0 z-50 grid place-items-center"
      onClick={() => setEditOpen(false)}
      >
        <div className="absolute inset-0 bg-black/30" aria-hidden />
          <form
          onSubmit={(e) => {
          e.preventDefault();
          saveEditInfo();
        }}
      onClick={(e) => e.stopPropagation()}
      className="relative w-[460px] rounded-xl bg-white p-5 shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-group-title"
      >
        <h3 id="edit-group-title" className="mb-4 text-lg font-bold">
          그룹 정보 수정
        </h3>

      {/* 그룹명 */}
      <label className="mb-3 block text-sm font-medium">
        그룹명
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-300"
          placeholder="그룹명을 입력해주세요."
        />
      </label>

      {/* 시작일, 종료일 */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">
          시작일
          <input
            type="date"
            value={startISO}
            min={startISO}
            onChange={(e) => setStartISO(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer"
          />
        </label>

        <label className="block text-sm font-medium">
          종료일
          <input
            type="date"
            value={endISO}
            min={startISO}
            onChange={(e) => setEndISO(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer"
          />
        </label>
      </div>

      {editError && <div className="mb-3 text-sm text-rose-500">{editError}</div>}

      {/* 취소, 저장 버튼 */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(false)}
          className="rounded-lg border px-4 py-2 cursor-pointer"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60 cursor-pointer"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  </div>
)}

</div>
  );
}
