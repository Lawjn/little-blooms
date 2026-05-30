/**
 * Một lượt tin nhắn trong cuộc trò chuyện với AI coach ("Bloom").
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
