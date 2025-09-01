import { useProfileStore } from "@/store/profileStore";
import { useEffect } from "react";
import { useParams } from "react-router";
import GroupList from "../components/GroupList";
import { useMyGroups } from "../hooks/useMyGroups";
import { useSessionReady } from "../hooks/useSessionReady";


export default function GroupsPage() {
  const { userId } = useParams<{ userId: string }>();
  const sessionReady = useSessionReady();

  const { groups, loading, creating, addGroup, removeGroup } = useMyGroups(sessionReady);
  const { profile, fetchProfile } = useProfileStore();

  // userId가 있으면 프로필 불러오기
  useEffect(() => {
    if(!sessionReady || !userId) return;
    if(profile?.id === userId) return;
    fetchProfile(userId);
  }, [sessionReady, userId, fetchProfile, profile?.id]);

  const isInitialLoading = loading && groups.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col px-25 py-20">
      <div>
        <h1 className="text-3 font-extrabold mb-3">
          안녕하세요 {profile?.name ?? "사용자"}님!🤗
        </h1>
        <p className="text-2 mb-20">오늘은 어떤 여행을 계획해 볼까요?</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent pr-2">
        <h2 className="text-4 font-extrabold mb-10">나의 그룹 👯‍♀️</h2>
        {isInitialLoading ? null : (
          <GroupList groups={groups} onAdd={addGroup} creating={creating} onDelete={removeGroup} />
        )}
      </div>
    </div>
  );
}
