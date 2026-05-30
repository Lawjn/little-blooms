// Supabase Edge Function: "ai-coach"
// "Bloom" — người bạn AI: check-in cảm xúc + lời khuyên điều chỉnh lifestyle.
//
// Dùng GROQ (chạy model mã nguồn mở Llama 3.3) — free tier rộng, không cần billing.
// API theo chuẩn OpenAI chat completions.
//
// Bảo mật: GROQ_API_KEY lưu làm SECRET của Edge Function (không nằm trong app).
// Client gọi qua supabase.functions.invoke('ai-coach', { body: { messages, moodContext } }).
//
// Deploy: Supabase Dashboard → Edge Functions → function "ai-coach" → paste file này → Deploy.
// Secret:  Dashboard → Edge Functions → Secrets → thêm GROQ_API_KEY (lấy ở console.groq.com).

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') ?? '';
// Model mở chạy trên Groq. Đổi tại đây nếu cần (vd llama-3.1-8b-instant cho nhanh hơn).
const GROQ_MODEL = Deno.env.get('GROQ_MODEL') ?? 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `Bạn là "Bloom" — người bạn AI ấm áp trong ứng dụng nhật ký cảm xúc "Little Blooms".

VAI TRÒ CỦA BẠN:
- Hỏi thăm người dùng một cách chân thành: hôm nay của họ thế nào, ăn uống đầy đủ chưa, ngủ nghỉ ra sao, có chuyện gì vui hay buồn.
- Lắng nghe, đồng cảm, rồi PHÂN TÍCH nhẹ nhàng dựa trên những gì họ chia sẻ + dữ liệu cảm xúc gần đây.
- Đưa ra LỜI KHUYÊN cụ thể, dễ làm để điều chỉnh lối sống tích cực hơn: ăn uống, vận động, ngủ nghỉ, uống nước, dành thời gian cho bản thân, hoặc kết nối với người thân/bạn bè.

PHONG CÁCH:
- LUÔN trả lời bằng TIẾNG VIỆT, ấm áp, gần gũi như một người bạn thật sự quan tâm. Có thể dùng emoji nhẹ nhàng (🌱🌸💛) nhưng đừng lạm dụng.
- NGẮN GỌN: thường 2–5 câu. Mỗi lượt kết thúc bằng MỘT câu hỏi mở để duy trì trò chuyện.
- Không thuyết giáo, không liệt kê máy móc, không phán xét. Khen ngợi những nỗ lực nhỏ.

GIỚI HẠN QUAN TRỌNG (an toàn):
- Bạn KHÔNG phải bác sĩ, chuyên gia tâm lý hay nhà trị liệu. Chỉ hỗ trợ điều chỉnh lối sống, không chẩn đoán bệnh, không kê thuốc.
- Nếu người dùng có dấu hiệu buồn nặng, tuyệt vọng, muốn tự làm hại bản thân hoặc khủng hoảng: hãy thật dịu dàng, thể hiện sự quan tâm, và KHUYẾN KHÍCH họ tâm sự với người thân tin cậy hoặc tìm đến chuyên gia/đường dây hỗ trợ tâm lý. Đừng cố tự "chữa" cho họ.
- Khi đưa lời khuyên nghiêm túc, nhắc nhẹ rằng bạn chỉ là người bạn đồng hành, không thay thế chuyên gia.`;

interface ClientMessage {
  role: 'user' | 'assistant';
  content: string;
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Chỉ hỗ trợ POST' }, 405);
  }
  if (!GROQ_API_KEY) {
    return json({ error: 'Server chưa cấu hình GROQ_API_KEY' }, 500);
  }

  try {
    const { messages, moodContext } = (await req.json()) as {
      messages?: ClientMessage[];
      moodContext?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'Thiếu messages' }, 400);
    }

    const systemText = moodContext
      ? `${SYSTEM_PROMPT}\n\n--- Dữ liệu cảm xúc gần đây của người dùng (tham khảo để cá nhân hoá, đừng đọc lại máy móc) ---\n${moodContext}`
      : SYSTEM_PROMPT;

    // Chuẩn OpenAI: system trước, rồi 20 lượt gần nhất
    const groqMessages = [
      { role: 'system', content: systemText },
      ...messages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.85,
        max_tokens: 600,
        top_p: 0.95,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json({ error: 'Groq API lỗi', detail }, 502);
    }

    const data = await res.json();
    const reply: string = data?.choices?.[0]?.message?.content?.trim() ?? '';

    if (!reply) {
      return json({
        reply:
          'Mình ở đây với bạn nè. Có vẻ điều bạn đang trải qua khá nặng — nếu được, hãy chia sẻ với một người thân mà bạn tin tưởng nhé. Bạn muốn kể thêm cho mình nghe không? 💛',
      });
    }

    return json({ reply });
  } catch (err) {
    return json({ error: 'Lỗi xử lý', detail: String(err) }, 500);
  }
});
