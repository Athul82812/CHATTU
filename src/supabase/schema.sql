-- Run this SQL in your Supabase project SQL Editor

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  photo_url TEXT,
  online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.chats (
  id TEXT PRIMARY KEY,
  participant1 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  participant2 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  last_message TEXT DEFAULT '',
  last_sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.messages (
  id BIGSERIAL PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender_name TEXT,
  audio_url TEXT,
  duration REAL,
  mime_type TEXT DEFAULT 'audio/mp4',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_chats_participant1 ON public.chats(participant1);
CREATE INDEX idx_chats_participant2 ON public.chats(participant2);
CREATE INDEX idx_chats_updated_at ON public.chats(updated_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Users: all authenticated users can see each other (for discovery)
CREATE POLICY "users_select_all" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Chats: participants can read/insert/update their chats
CREATE POLICY "chats_select_participant" ON public.chats
  FOR SELECT USING (auth.uid() IN (participant1, participant2));

CREATE POLICY "chats_insert_participant" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() IN (participant1, participant2));

CREATE POLICY "chats_update_participant" ON public.chats
  FOR UPDATE USING (auth.uid() IN (participant1, participant2));

-- Messages: participants can read/insert messages in their chats
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND (participant1 = auth.uid() OR participant2 = auth.uid()))
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND (participant1 = auth.uid() OR participant2 = auth.uid()))
  );

-- Storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "profiles_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "profiles_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profiles' AND auth.role() = 'authenticated'
  );

CREATE POLICY "profiles_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profiles' AND auth.role() = 'authenticated'
  );

-- Storage bucket for chat audio messages
INSERT INTO storage.buckets (id, name, public) VALUES ('chat_audio', 'chat_audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "chat_audio_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat_audio');

CREATE POLICY "chat_audio_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat_audio' AND auth.role() = 'authenticated'
  );

CREATE POLICY "chat_audio_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'chat_audio' AND auth.role() = 'authenticated'
  );
