import defaultProfile from "@/assets/defaultprofile.svg";
import { GoDotFill } from "react-icons/go";
import { getColorForUser } from "../utils/colorUtils";

type Props = {
  members: {
    user_id: string;
    name: string;
    avatar_url: string | null;
  }[];
  onlineUserIds: string[];
};

export default function GroupMemberList({ members, onlineUserIds }: Props) {
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
              onError={(e) =>
                ((e.currentTarget as HTMLImageElement).src = defaultProfile)
              }
            />
            <p>{m.name}</p>
            {isOnline && <GoDotFill className={`size-5 ${dotColor}`} />}
          </li>
        );
      })}
    </ul>
  );
}