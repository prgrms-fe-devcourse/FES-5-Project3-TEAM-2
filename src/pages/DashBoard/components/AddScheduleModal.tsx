import { useState, useEffect } from "react";
import { insertPlanItem, type PlanItemInsert } from "../api/insertPlanItem";
import { toast } from "@/components/Sweetalert";

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  scheduleData?: {
    location: LocationData;
    day: string;
    groupId: string;
  };
}

export default function AddScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  scheduleData,
}: AddScheduleModalProps) {
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<"title" | "date", string>>
  >({});

  useEffect(() => {
    if (isOpen && scheduleData) {
      setTitle(scheduleData.location.name || "");
      setSelectedDate(
        scheduleData.day || new Date().toISOString().split("T")[0],
      );
      setErrors({ title: "", date: "" });
    }
  }, [isOpen, scheduleData]);

  const resetForm = () => {
    setTitle("");
    setSelectedDate("");
    setErrors({ title: "", date: "" });
  };

  const validate = () => {
    const newErrors = { title: "", date: "" };

    if (!title.trim()) {
      newErrors.title = "일정 제목을 입력해주세요.";
    }

    if (!selectedDate) {
      newErrors.date = "날짜를 선택해주세요.";
    }

    setErrors(newErrors);
    return !newErrors.title && !newErrors.date;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      const planItem: PlanItemInsert = {
        group_id: scheduleData!.groupId,
        day: selectedDate,
        title: title.trim(),
        address: scheduleData!.location.address || "",
        latitude: scheduleData!.location.lat,
        longitude: scheduleData!.location.lng,
      };
      await insertPlanItem(planItem);
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "일정을 저장하지 못했습니다.",
        icon: "error",
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 맥의 한글 IME 중복 처리 방지
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
  };

  if (!isOpen || !scheduleData) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-[460px] rounded-xl bg-white p-5 shadow-xl"
      >
        <h3 className="mb-4 text-lg font-bold">일정 추가</h3>

        {/* 제목 */}
        <label className="mb-3 block text-sm font-medium">
          일정 제목
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
              errors.title
                ? "border-red-300 focus:ring-red-300"
                : "border-slate-200 focus:ring-rose-300"
            }`}
            placeholder="일정 제목을 입력하세요"
          />
          {errors.title && (
            <span className="mt-1 block text-sm text-red-600">
              {errors.title}
            </span>
          )}
        </label>

        {/* 위치 정보 - 주소가 있을 때만 표시 */}
        {scheduleData.location.address && (
          <label className="mb-3 block text-sm font-medium">
            위치
            <div className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 bg-slate-50 text-sm text-slate-600">
              {scheduleData.location.address}
            </div>
          </label>
        )}

        {/* 날짜 선택 */}
        <label className="mb-4 block text-sm font-medium">
          날짜
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
              errors.date
                ? "border-red-300 focus:ring-red-300"
                : "border-slate-200 focus:ring-rose-300"
            }`}
          />
          {errors.date && (
            <span className="mt-1 block text-sm text-red-600">
              {errors.date}
            </span>
          )}
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? "저장 중" : "추가"}
          </button>
        </div>
      </form>
    </div>
  );
}
