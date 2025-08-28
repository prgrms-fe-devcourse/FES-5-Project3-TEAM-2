import { useState, useMemo, useEffect } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortableList } from "../hooks/useSortableList";
import PlanItem from "./PlanItem";
import PlanItemOverlay from "./PlanItemOverlay";
import AddPlanItemModal from "./AddPlanItemModal";
import { usePlanStore } from "../store/planStore";
import { useGroupStore } from "../store/groupStore"; 
import { insertPlanItem } from "../api/insertPlanItem";

function PlanList() {
  const selectedDay = usePlanStore((state) => state.selectedDay);
  const allPlanItems = usePlanStore((state) => state.allPlanItems);
  const addPlanItem = usePlanStore((state) => state.addPlanItem);
  const reorderPlanItems = usePlanStore((state) => state.reorderPlanItems);

  const group = useGroupStore((state) => state.group); // ✅ 현재 그룹 정보 가져오기
  const [isModalOpen, setIsModalOpen] = useState(false);

  const planItems = useMemo(() => {
    return allPlanItems
      .filter((item) => item.day === selectedDay)
      .sort((a, b) =>
        a.sort_order < b.sort_order ? -1 : a.sort_order > b.sort_order ? 1 : 0,
      );
  }, [allPlanItems, selectedDay]);

  // 드래그 완료 후 서버 업데이트 콜백
  const handleItemsReordered = async (
    newItemOrder: string[],
    draggedItemId: string,
  ) => {
    try {
      const firstItem = planItems[0];
      if (!firstItem) {
        console.error("planItems가 비어있습니다.");
        return;
      }

      const reorderedPlanItems = newItemOrder
        .map((id) => planItems.find((item) => item.id === id)!)
        .map((item) => ({
          ...item,
          dragged: item.id === draggedItemId,
        }));

      await reorderPlanItems(
        draggedItemId,
        firstItem.group_id,
        selectedDay,
        reorderedPlanItems,
      );
    } catch (error) {
      console.error("스토어 업데이트 실패:", error);
      setItems(planItems.map((item) => item.id));
    }
  };

  // 일정 추가 핸들러
  async function handleAddPlan(title: string) {
    if (!group) {
      console.error("❌ 그룹 정보 없음. groupStore를 먼저 설정하세요.");
      return;
    }

    try {
      const newItem = await insertPlanItem(
        {
          group_id: group.id, 
          title,
          day: selectedDay,
        },
        planItems,
      );

      addPlanItem(newItem); 
    } catch (err) {
      console.error("❌ 일정 추가 실패:", err);
    }
  }

  const {
    items,
    setItems,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useSortableList({
    initialItems: planItems.map((item) => item.id),
    onItemsReordered: handleItemsReordered,
  });

  useEffect(() => {
    setItems(planItems.map((item) => item.id));
  }, [planItems, setItems]);

  const activePlan = activeId ? planItems.find((p) => p.id === activeId) : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <ul className="flex flex-col gap-2 h-[350px] overflow-auto" role="list">
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((id, idx) => {
              const plan = planItems.find((p) => p.id === id);
              if (!plan) return null;
              return (
                <PlanItem key={plan.id} {...plan} displayIndex={idx + 1} />
              );
            })}
          </SortableContext>

          <li>
            <button
              type="button"
              className="h-[60px] flex w-full items-center justify-center rounded-[10px] bg-secondary font-extrabold text-white hover:brightness-95 active:brightness-90"
              onClick={() => setIsModalOpen(true)}
            >
              + 커스텀 일정 추가하기
            </button>
          </li>
        </ul>

        <DragOverlay>
          {activePlan ? (
            <PlanItemOverlay
              {...activePlan}
              displayIndex={
                planItems.findIndex((p) => p.id === activePlan.id) + 1
              }
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddPlanItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPlan}
      />
    </>
  );
}

export default PlanList;
