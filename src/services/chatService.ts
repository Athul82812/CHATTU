import { File } from "expo-file-system";
import { supabase } from "../supabase/supabase";

export const createChatIfNotExists = async (
  uid1: string,
  uid2: string
): Promise<string> => {
  const chatId = uid1 > uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

  const { data: existing } = await supabase
    .from("chats")
    .select("id")
    .eq("id", chatId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("chats").insert({
      id: chatId,
      participant1: uid1,
      participant2: uid2,
      last_message: "",
    });
  }

  return chatId;
};

export const sendMessage = async (
  chatId: string,
  text: string,
  senderId: string,
  senderName: string
) => {
  if (!text.trim()) return;

  const { error: msgError } = await supabase.from("messages").insert({
    chat_id: chatId,
    text,
    sender_id: senderId,
    sender_name: senderName,
  });

  if (msgError) {
    console.error("Error sending message:", msgError.message);
    return;
  }

  await supabase
    .from("chats")
    .update({
      last_message: text,
      last_sender_id: senderId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", chatId);
};

export const sendAudioMessage = async (
  chatId: string,
  audioUri: string,
  duration: number,
  senderId: string,
  senderName: string
) => {
  const fileName = `audio/${chatId}/${senderId}_${Date.now()}.m4a`;

  const audioFile = new File(audioUri);
  const arrayBuffer = await audioFile.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("chat_audio")
    .upload(fileName, arrayBuffer, { contentType: "audio/mp4" });

  if (uploadError) {
    console.error("Error uploading audio:", uploadError.message);
    return;
  }

  const { data: urlData } = supabase.storage
    .from("chat_audio")
    .getPublicUrl(fileName);

  const audioUrl = urlData.publicUrl;

  const { error: msgError } = await supabase.from("messages").insert({
    chat_id: chatId,
    text: "🎤 Voice message",
    audio_url: audioUrl,
    duration,
    mime_type: "audio/mp4",
    sender_id: senderId,
    sender_name: senderName,
  });

  if (msgError) {
    console.error("Error sending audio message:", msgError.message);
    return;
  }

  await supabase
    .from("chats")
    .update({
      last_message: "🎤 Voice message",
      last_sender_id: senderId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", chatId);
};

const mapMessage = (m: any) => ({
  id: String(m.id),
  text: m.text,
  senderId: m.sender_id,
  senderName: m.sender_name,
  chatId: m.chat_id,
  isRead: m.is_read,
  createdAt: m.created_at,
  audioUrl: m.audio_url,
  duration: m.duration,
  mimeType: m.mime_type,
});

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: any[]) => void
) => {
  let currentMessages: any[] = [];

  supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        console.error("Error loading messages:", error.message);
        return;
      }
      if (data) {
        currentMessages = data.map(mapMessage);
        callback(currentMessages);
      }
    });

  const channel = supabase
    .channel(`messages:${chatId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        const newMsg = mapMessage(payload.new as any);
        currentMessages = [...currentMessages, newMsg];
        callback(currentMessages);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const markMessageAsRead = async (
  chatId: string,
  messageId: string
) => {
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId);
};
