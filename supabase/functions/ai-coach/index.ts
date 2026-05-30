// Supabase Edge Function: "ai-coach"
// "Bloom" — người bạn AI: check-in cảm xúc + lời khuyên điều chỉnh lifestyle.
//
// Bảo mật: GEMINI_API_KEY lưu làm SECRET của Edge Function (không nằm trong app).
// Client gọi qua supabase.functions.invoke('ai-coach', { body: { messages, moodContext } }).
//
// Deploy: Supabase Dashboard → Edge Functions → tạo function tên "ai-coach" → paste file này.
// Secret:  Dashboard → Edge Functions → Manage secrets → thêm GEMINI_API_KEY.

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
- Trả lời bằng TIẾNG VIỆT, ấm áp, gần gũi như một người bạn thật sự quan tâm. Có thể dùng emoji nhẹ nhàng (🌱🌸💛) nhưng đừng lạm dụng.
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
  if (!GEMINI_API_KEY) {
    return json({ error: 'Server chưa cấu hình GEMINI_API_KEY' }, 500);
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

    // Chỉ giữ 20 lượt gần nhất để gọn context
    const contents = messages.slice(-20).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    // Gemini yêu cầu lượt đầu tiên phải là 'user' → bỏ các lượt 'model' dẫn đầu
    // (ví dụ câu chào mở đầu do app tự seed).
    while (contents.length && contents[0].role === 'model') contents.shift();
    if (contents.length === 0) {
      return json({ error: 'Chưa có nội dung từ người dùng' }, 400);
    }

    const body = {
      systemInstruction: { parts: [{ text: systemText }] },
      contents,
      generationConfig: { temperature: 0.85, topP: 0.95, maxOutputTokens: 600 },
      // Nới safety để model vẫn đồng hành khi user chia sẻ chuyện buồn,
      // thay vì từ chối trả lời. Nội dung thật sự nguy hiểm vẫn bị chặn (HIGH).
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    };

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json({ error: 'Gemini API lỗi', detail }, 502);
    }

    const data = await res.json();
    const reply: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('')
        .trim() ?? '';

    if (!reply) {
      // Bị safety chặn hoặc trả rỗng
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
