/**
 * Bộ câu an ủi / động viên hiện khi user tưới cây.
 * Tông ấm áp, nhẹ nhàng theo phong cách chữa lành đang viral trên MXH Việt.
 * Mỗi lần tưới → 1 câu ngẫu nhiên (không lặp lại câu ngay trước đó).
 */

export const WATERING_QUOTES: string[] = [
  'Hôm nay bạn đã cố gắng nhiều rồi, nghỉ một chút cũng không sao đâu. 🌱',
  'Không phải ngày nào cũng cần rực rỡ. Có những ngày chỉ cần tồn tại là đủ. 💛',
  'Bạn không đơn độc đâu, luôn có người mong bạn ổn. 🌸',
  'Chậm lại một nhịp cũng được, miễn là bạn không bỏ cuộc. 🍀',
  'Cảm xúc nào rồi cũng sẽ qua, kể cả những ngày khó nhất. 🌈',
  'Bạn xứng đáng được dịu dàng, nhất là từ chính mình. 🤍',
  'Mỗi ngày bạn thức dậy và tiếp tục, đó đã là một loại dũng cảm. 💪',
  'Đừng quên uống nước và hít thở thật sâu nhé. 🌿',
  'Một bông hoa không nở vội, và bạn cũng vậy. 🌷',
  'Bạn đã đi xa hơn mình nghĩ rất nhiều rồi đó. ✨',
  'Ổn hay chưa ổn, bạn vẫn luôn đủ tốt. 💗',
  'Cho phép bản thân được mệt, rồi mình lại đứng dậy. 🌻',
  'Những điều tốt đẹp đang trên đường đến với bạn. 🌼',
  'Hôm nay khó khăn, nhưng bạn còn mạnh mẽ hơn thế nhiều. 🔥',
  'Tử tế với bản thân hôm nay, bạn nhé. 🫶',
  'Bầu trời sau cơn mưa luôn trong hơn một chút. 🌦️',
  'Bạn không cần phải mạnh mẽ mọi lúc đâu. 🌙',
  'Chỉ cần tiến một bước nhỏ thôi cũng đáng tự hào rồi. 👣',
  'Trái tim bạn đã làm việc chăm chỉ lắm rồi, ôm nó một cái nhé. 💞',
  'Mọi chuyện rồi sẽ ổn thôi, tin mình đi. 🌟',
  'Bạn là điều đặc biệt mà thế giới này đang cần. 🌍',
  'Buồn cũng được, nhưng đừng buồn một mình nhé. ☁️',
  'Hãy tự hào vì bạn vẫn ở đây, vẫn cố gắng mỗi ngày. 🌱',
  'Năng lượng của bạn quý giá, hãy dành cho điều xứng đáng. 🔆',
  'Một ngày tệ không có nghĩa là một cuộc đời tệ. 🍃',
  'Bạn đang làm tốt hơn bạn tưởng rất nhiều. 💫',
  'Nghỉ ngơi cũng là một phần của sự trưởng thành. 🌳',
  'Hãy để hôm nay nhẹ nhàng trôi qua. 🕊️',
  'Bạn vừa gieo một hạt mầm tốt lành cho hôm nay. 🌾',
  'Dù chuyện gì xảy ra, ngày mai vẫn là một khởi đầu mới. 🌅',
];

/**
 * Lấy 1 câu ngẫu nhiên, tránh trùng với câu vừa hiện (prev).
 */
export function getRandomWateringQuote(prev?: string): string {
  if (WATERING_QUOTES.length === 1) return WATERING_QUOTES[0];
  let next = prev;
  while (next === prev) {
    next = WATERING_QUOTES[Math.floor(Math.random() * WATERING_QUOTES.length)];
  }
  return next as string;
}
