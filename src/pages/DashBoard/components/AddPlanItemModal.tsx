import { useEffect } from "react";

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

function AddPlanItemModal({ isOpen, onClose, onSubmit }: AddPlanModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    function handleEscapeKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => document.removeEventListener("keydown", handleEscapeKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const title = formData.get("title") as string;
    if (title.trim().length === 0) return;
    onSubmit(title);
    onClose();
  }

  // 백드롭 클릭 핸들러
  function handleBackdropClick(e: React.MouseEvent) {
    // 클릭된 요소가 백드롭 자체인지 확인
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 shadow-lg"
      onClick={handleBackdropClick} // 백드롭 클릭 이벤트
    >
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">새 일정 추가 ✨</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="title"
            placeholder="일정 제목 입력"
            className="border-2 border-gray-300 focus:border-primary focus:outline-none rounded-md p-2"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-white hover:brightness-95 cursor-pointer"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPlanItemModal;