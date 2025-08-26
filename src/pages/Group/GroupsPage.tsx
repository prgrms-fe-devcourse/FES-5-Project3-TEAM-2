import { supabase } from "@/lib/supabaseClient";
import { useProfileStore } from "@/store/profileStore";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import cardbg from "@/assets/cardbg.png";
import cardAdd from "@/assets/icons/cardAdd.svg";
import edit from "@/assets/icons/cardedit.svg";

type Group = {
  id: string;
  name: string;
  start_day: string;
  end_day: string;
};

// 2025-08-26 => 25.08.26
const formatDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, day] = iso.split("-");
  return `${y.slice(2)}.${m}.${day}`;
};

// 2025-08-26
const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

function GroupsPage() {
  const { userId } = useParams<{ userId: string }>(); // URL에서 userId 가져오기
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessionReady, setSessionReady] = useState(false);
  const { profile, setProfile } = useProfileStore();


  // 세션 준비되기까지 대기
  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      } else {
        const { data: sub } = supabase.auth.onAuthStateChange((event) => {
          if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
            setSessionReady(true);
            sub.subscription.unsubscribe();
          }
        });
        unsub = () => sub.subscription.unsubscribe();
      }
    })();

    return () => unsub?.();
  }, []);

  // 프로필 불러오기
  useEffect(() => {
    if (!userId || !sessionReady) return;

    (async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("name, avatar_url")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("프로필 로드 실패:", error);
        return;
      }
      setProfile(data);
    })();
  }, [userId, sessionReady, setProfile]);

  // 내 그룹 목록 불러오기
  useEffect(() => {
    if (!sessionReady) return;

    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("groups")
          .select("id, name, start_day, end_day")
          .order("start_day", { ascending: false });

        if (error) {
          console.error("그룹 목록 로드 실패:", error);
          setGroups([]);
          return;
        }

        setGroups(
          (data ?? []).map((g) => ({
            id: g.id,
            name: g.name,
            start_day: g.start_day,
            end_day: g.end_day,
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionReady]); // 세션 준비 여부에 의존

  if (!profile) return <p>프로필 불러오는 중...</p>;

  /* 그룹카드 추가 */
  const addGroup = async () => {
    if (creating) return;
    setCreating(true);

    try {
      const { data: sessionRes, error: sErr } = await supabase.auth.getSession();
      const session = sessionRes?.session;

      if (sErr || !session) {
        alert("로그인이 필요합니다.");
        console.error(sErr);
        return;
      }

      const uid = session.user.id;
      const newId = crypto.randomUUID();
      const today = new Date();

      const payload = {
        id: newId,
        name: "새 여행",
        owner_id: uid,
        start_day: toISO(today),
        end_day: toISO(addDays(today, 2)),
      };

      // 1) 그룹 생성
      const { data, error } = await supabase
        .from("groups")
        .insert([payload])
        .select("id, name, start_day, end_day")
        .single();

      if (error) {
        alert("그룹 생성에 실패했습니다.");
        console.error("그룹 생성 에러:", error);
        setCreating(false);
        return;
      }

      // 2) 만든 그룹에 나 자신을 멤버로 추가
      const { error: mErr } = await supabase
        .from("groupmembers")
        .insert([{ group_id: data.id, user_id: uid, role: "admin" }]);

      if (mErr) {
        console.error("groupmembers 추가 실패:", mErr);
      }

      // 3) 로컬 상태 반영
      setGroups((prev) => [
        {
          id: data.id,
          name: data.name,
          start_day: data.start_day,
          end_day: data.end_day,
        },
        ...prev,
      ]);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-25 py-20">
      {/* 헤더 */}
      <div className="mb-20">
        <h1 className="text-2xl font-extrabold">안녕하세요 {profile.name}님!</h1>
        <p className="text-1 font-bold">오늘은 어떤 여행을 계획해 볼까요?</p>
      </div>

      {/* 그룹카드 */}
      <div>
        <h2 className="text-2xl font-extrabold mb-10">나의 그룹</h2>

        {loading ? (
          <p>불러오는 중…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="w-full max-w-[480px] aspect-[20/9] bg-white rounded-2xl cursor-pointer drop-shadow-[4px_4px_4px_rgba(0,0,0,0.25)]"
              >
                {/* 배경 + 제목 + 편집버튼 */}
                <div className="relative aspect-[20/9]">
                  <img
                    src={cardbg}
                    alt="배경이미지"
                    className="h-full w-full object-cover rounded-t-2xl"
                  />

                  <h3 className="absolute left-5 top-5 text-[44px] font-extrabold text-white drop-shadow-[4px_4px_4px_rgba(0,0,0,0.25)]">
                    {group.name}
                  </h3>

                  <button
                    type="button"
                    className="absolute right-4 top-4 px-4 py-3 hover:bg-gray-50/50 hover:px-4 rounded-3xl cursor-pointer"
                  >
                    <img src={edit} alt="카드 편집 버튼" />
                  </button>
                </div>

                {/* 날짜 + 초대링크 */}
                <div className="flex items-center justify-between px-4 py-3 rounded-b-2xl">
                  <p className="text-1 font-bold">
                    {formatDate(group.start_day)} ~ {formatDate(group.end_day)}
                  </p>
                  <button
                    type="button"
                    className="text-1 text-white bg-tertiary px-3 py-2 rounded-4xl cursor-pointer hover:bg-fourth hover:text-tertiary transition"
                  >
                    초대링크 복사
                  </button>
                </div>
              </div>
            ))}

            {/* 그룹카드 추가 */}
            <button
              type="button"
              onClick={addGroup}
              className="w-full max-w-[480px] aspect-[20/9]  bg-secondary rounded-2xl shadow-[4px_4px_4px_rgba(0,0,0,0.25)] cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <img src={cardAdd} alt="그룹 카드 추가" />
                <p className="text-4xl font-extrabold text-white">그룹 추가</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default GroupsPage;
