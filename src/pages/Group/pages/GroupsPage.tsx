import { useProfileStore } from "@/store/profileStore";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import AddGroupModal from "../components/AddGroupModal";
import GroupList from "../components/GroupList";
import { useMyGroups } from "../hooks/useMyGroups";
import { useSessionReady } from "../hooks/useSessionReady";


export default function GroupsPage() {
  const { userId } = useParams<{ userId: string }>();
  const sessionReady = useSessionReady();

  const { groups, loading, creating, addGroup, removeGroup } = useMyGroups(sessionReady);
  const { profile, fetchProfile } = useProfileStore();

  const [openAdd, setOpenAdd] = useState(false);
  const openModal = useCallback(() => setOpenAdd(true), []);
  const closeModal  = useCallback(() => setOpenAdd(false), []);

  // userId가 있으면 프로필 불러오기
  useEffect(() => {
    if(!sessionReady || !userId) return;
    if(profile?.id === userId) return;
    fetchProfile(userId);
  }, [sessionReady, userId, fetchProfile, profile?.id]);

  const isInitialLoading = loading && groups.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col px-[50px] py-[50px]">
      <div>
        <h1 className="text-3 font-extrabold mb-3">
          안녕하세요 {profile?.name ?? "사용자"}님!🤗
        </h1>
        <p className="text-2 mb-20">오늘은 어떤 여행을 계획해 볼까요?</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <h2 className="text-4 font-extrabold mb-10">나의 그룹 👯‍♀️</h2>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar scrollbar-thumb-primary scrollbar-track-transparent pr-2">
        {isInitialLoading ? null : (
          <GroupList groups={groups} onAdd={openModal} creating={creating} onDelete={removeGroup} />
        )}
      </div>

      {/* 새 그룹 추가 모달 */}
      <AddGroupModal
        open={openAdd}
        onClose={closeModal}
        onCreate={addGroup}
        creating={creating}
      />
      </div>
    </div>
  );
}
