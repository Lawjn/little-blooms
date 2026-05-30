import { supabase } from '@/lib/supabase';
import type { ChatMessage } from './types';

/**
 * Gọi Edge Function "ai-coach" → Gemini sinh phản hồi.
 * Key Gemini nằm ở server (Edge Function secret), client không thấy.
 */
export async function sendCoachMessage(params: {
  messages: ChatMessage[];
  moodContext?: string;
}): Promise<string> {
  // Chỉ gửi role + content (id là chuyện của client)
  const payload = params.messages.map((m) => ({ role: m.role, content: m.content }));

  const { data, error } = await supabase.functions.invoke('ai-coach', {
    body: { messages: payload, moodContext: params.moodContext },
  });

  if (error) {
    console.warn('[ai-coach] invoke error:', error);
    throw new Error('Không gọi được AI. Kiểm tra kết nối mạng hoặc thử lại sau.');
  }

  const reply = (data as { reply?: string } | null)?.reply;
  if (!reply) {
    throw new Error('AI chưa phản hồi. Bạn thử lại nhé.');
  }
  return reply;
}
