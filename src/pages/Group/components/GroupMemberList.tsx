import defaultProfile from "@/assets/defaultprofile.svg";
import { GoDotFill } from "react-icons/go";
import { getColorForUser } from "../utils/colorUtils";

export type GroupMember = {
  user_id: string;
  name: string;
  avatar_url: string | null;
};

interface Props  {
  members: GroupMember[];
  onlineUserIds: string[];
};

export default function GroupMemberList({ members, onlineUserIds }: Props) {
  if (members.length === 0) {
    return <p className="text-gray-400 text-sm">멤버가 없습니다.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {members.map((m) => {
        const isOnline = onlineUserIds.includes(m.user_id);
        const dotColor = getColorForUser(m.user_id);

        return (
          <li key={m.user_id} className="flex gap-3 items-center">
            <img
              className="size-8 rounded-full"
              src={m.avatar_url ?? defaultProfile}
              alt={`${m.name} 프로필 이미지`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultProfile;
              }}
            />
            <p className="text-sm font-medium">{m.name}</p>
            {isOnline && <GoDotFill className={`size-5 ${dotColor}`} />}
          </li>
        );
      })}
    </ul>
  );
}