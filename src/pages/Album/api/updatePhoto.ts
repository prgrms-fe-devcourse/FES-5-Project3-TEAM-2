import { supabase } from "@/lib/supabaseClient";

export interface PhotoChangePayload {
  action: "upload" | "delete";
  photoId: string;
  actionUserId: string;
  timestamp: string;
  groupId?: string;
}

export const subscribePhotoUpdates = (
  groupId: string,
  userId: string,
  callback: () => void,
) => {
  const channel = supabase
    .channel(`photos_${groupId}`)
    .on(
      "broadcast",
      { event: "photo_change" },
      (payload) => {
        const { action, actionUserId } = payload.payload as PhotoChangePayload;
        
        // 내가 한 액션이면 알림 없음
        if (actionUserId === userId) {
          return;
        }

        // 다른 사람의 액션이면 알림 표시
        if (action === "upload" || action === "delete") {
          callback();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const broadcastPhotoChange = async (
  groupId: string,
  userId: string,
  action: "upload" | "delete",
  photoId: string
) => {
  try {
    const channel = supabase.channel(`photos_${groupId}`);
    
    const payload: PhotoChangePayload = {
      action,
      photoId,
      actionUserId: userId,
      timestamp: new Date().toISOString(),
      groupId
    };

    return await channel.send({
      type: "broadcast",
      event: "photo_change",
      payload
    });

  } catch (error) {
    console.error("브로드캐스트 전송 에러:", error);
    throw error;
  }
};
