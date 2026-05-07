/**
 * Pool quotes hiển thị sau khi user save mood entry.
 * Tiếng Việt, ngắn gọn, encouraging — không generic, không mang tính y khoa.
 * Random pick mỗi lần save.
 */
export const MOOD_QUOTES: readonly string[] = [
  'Mỗi ngày là 1 trang mới của bạn 🌱',
  'Cảm xúc hôm nay sẽ thành ký ức của ngày mai.',
  'Note nhỏ hôm nay, hành trình lớn ngày mai.',
  'Bạn đang gieo từng mầm cây cảm xúc 🌷',
  'Một bước nhỏ, một cây hoa mới mọc.',
  'Ngày bình thường vẫn xứng đáng được ghi lại.',
  'Vườn của bạn đang lớn lên từng ngày.',
  'Cảm xúc của bạn quan trọng. Cảm ơn vì đã share.',
  'Hôm nay bạn đã sống — đó là điều đáng note 💛',
  'Không có cảm xúc nào là sai. Chỉ là dấu hiệu của bản thân.',
  'Một dòng note hôm nay, kỷ niệm cho 1 năm sau.',
  'Tiếp tục nuôi dưỡng vườn nhé 🌻',
  'Self-awareness bắt đầu từ những note nhỏ như này.',
  'Bạn đang xây dựng thói quen cực kỳ healthy 🌿',
  'Vườn của bạn unique, không ai giống bạn.',
  'Có ngày nắng có ngày mưa — vườn nào cũng cần cả 2.',
  'Cảm ơn bản thân hôm nay vì đã cố gắng.',
  'Hôm nay bạn đã viết tiếp câu chuyện của mình.',
  'Chậm lại 1 chút để check-in bản thân là 1 món quà.',
  'Mỗi entry là 1 hơi thở sâu cho tâm hồn.',
] as const;

export function getRandomQuote(): string {
  return MOOD_QUOTES[Math.floor(Math.random() * MOOD_QUOTES.length)];
}
