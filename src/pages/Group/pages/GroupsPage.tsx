import { useProfileStore } from "@/store/profileStore";
import { useEffect } from "react";
import { useParams } from "react-router";
import GroupList from "../components/GroupList";
import { useMyGroups } from "../hooks/useMyGroups";
import { useSessionReady } from "../hooks/useSessionReady";


export default function GroupsPage() {
  const { userId } = useParams<{ userId: string }>();
  const sessionReady = useSessionReady();

  const { groups, loading, creating, addGroup } = useMyGroups(sessionReady);
  const { profile, loading: profileLoading, fetchProfile } = useProfileStore();

  // userId가 있으면 프로필 불러오기
  useEffect(() => {
    if (sessionReady && userId) {
      fetchProfile(userId);
    }
  }, [sessionReady, userId, fetchProfile]);

  if (!sessionReady) return <p>세션 확인 중...</p>;
  if (profileLoading) return <p>프로필 불러오는 중...</p>;
  if (!profile) return <p>프로필이 없습니다.</p>;

  return (
    <div className="px-25 py-20">
      <div className="mb-20">
        <h1 className="text-3 font-extrabold mb-3">
          안녕하세요 {profile.name ?? "사용자"}님!🤗
        </h1>
        <p className="text-2 mb-20">오늘은 어떤 여행을 계획해 볼까요?</p>
      </div>

      <div>
        <h2 className="text-4 font-extrabold mb-10">나의 그룹 👯‍♀️</h2>
        {loading ? (
          <p>불러오는 중…</p>
        ) : (
          <GroupList groups={groups} onAdd={addGroup} creating={creating} />
        )}
      </div>
    </div>
  );
}
