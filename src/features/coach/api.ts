import { FunctionsHttpError, FunctionsFetchError } from '@supabase/supabase-js';
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

    // Function chạy nhưng trả lỗi (4xx/5xx) → đọc chi tiết để debug
    if (error instanceof FunctionsHttpError) {
      let detail = '';
      try {
        const body = await error.context.json();
        detail = body?.detail ?? body?.error ?? '';
      } catch {
        /* không đọc được body */
      }
      throw new Error(
        detail ? `Lỗi AI: ${detail}` : `Lỗi AI (HTTP ${error.context?.status ?? '?'}).`,
      );
    }

    // Không gọi tới được function (chưa deploy / sai tên / mạng)
    if (error instanceof FunctionsFetchError) {
      throw new Error(
        'Không kết nối được tới function "ai-coach". Kiểm tra đã deploy đúng tên chưa + mạng.',
      );
    }

    throw new Error(`Không gọi được AI: ${error.message}`);
  }

  const reply = (data as { reply?: string } | null)?.reply;
  if (!reply) {
    throw new Error('AI chưa phản hồi. Bạn thử lại nhé.');
  }
  return reply;
}
