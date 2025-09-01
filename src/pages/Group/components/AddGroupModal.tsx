import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {name:string, startISO: string; endISO: string}) => Promise<void>;
  creating?: boolean;
}

// 날짜 포맷 : Date객체 -> yyyy-mm-dd 문자열로 변환
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function AddGroupModal({open, onClose, onCreate, creating}: Props) {

  const [name,setName] = useState('');
  const [startISO, setStartISO] = useState(toISO(new Date())); // 오늘 날짜
  const [endISO, setEndISO] = useState(toISO(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if(open) {
      const today = new Date();
      setName('');
      setStartISO(toISO(today));
      setEndISO(toISO(new Date(today.getTime())));
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  if(!open) return null;

  const validate = () => {
    if(!name.trim()) return '그룹명을 입력해주세요.';
    if(!startISO || !endISO) return '시작일과 종료일을 모두 선택해 주세요.';
    if(startISO > endISO) return '종료일은 시작일 이후여야 합니다.';
    return null;
  };

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if(msg) {
      setError(msg);
      return;
    }
    setError(null);
    try{
      setSubmitting(true);
      await onCreate({name: name.trim(), startISO, endISO});
      onClose();
    } catch {
      setError('그룹 생성 실패');
    } finally {
      setSubmitting(false);
    }
  };


  const onOverlayClick = (e:React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const onContentClick = (e:React.MouseEvent) => {
    e.stopPropagation();
  }


  return (
    <div
    className="fixed inset-0 z-50 grid place-items-center"
    onClick={onOverlayClick} >
      <div className="absolute inset-0 bg-black/30" aria-hidden />
        <form
        onSubmit={handleSubmit}
        onClick={onContentClick}
        className="relative w-[460px] rounded-xl bg-white p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-group-title"
        >
          <h3 id="add-group-title" className="mb-4 text-lg font-bold">
            새 그룹
          </h3>

          {/* 그룹명 */}
          <label className="mb-3 block text-sm font-medium">
            그룹명
            <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-300"
            placeholder="예: 9월 오사카"
            />
          </label>

          {/* 시작일, 종료일 */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              시작일
              <input type="date"
              value={startISO}
              min={startISO}
              onChange={(e) => setStartISO(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer"
              />
            </label>

            <label className="block text-sm font-medium">
              종료일
              <input type="date"
              value={endISO}
              min={startISO}
              onChange={(e) => setEndISO(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer"
              />
            </label>
          </div>

          {error && <div className="mb-3 text-sm text-rose-500">{error}</div>}

          {/* 취소, 그룹추가 버튼 */}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 cursor-pointer">
              취소
            </button>
            <button type="submit"
            disabled={creating || submitting}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60 cursor-pointer"
            >
              {creating || submitting ? '생성 중...' : '그룹 추가'}
            </button>
          </div>
        </form>
    </div>
  )
}
