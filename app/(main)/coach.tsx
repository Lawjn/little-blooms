import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { buildMoodContext } from '@/features/coach/context';
import { useRecentMoodEntries, useSendCoachMessage } from '@/features/coach/hooks';
import type { ChatMessage } from '@/features/coach/types';
import { useUser } from '@/features/auth/store';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

let idCounter = 0;
const makeId = () => `m${Date.now()}_${idCounter++}`;

const GREETING =
  'Chào bạn 🌱 Mình là Bloom, người bạn đồng hành của bạn. Hôm nay của bạn thế nào? Ăn uống đầy đủ chưa, có chuyện gì vui hay buồn muốn kể cho mình nghe không?';

export default function CoachScreen() {
  const router = useRouter();
  const user = useUser();
  const recentQuery = useRecentMoodEntries(user?.id);
  const sendMutation = useSendCoachMessage();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'greeting', role: 'assistant', content: GREETING },
  ]);
  const [input, setInput] = useState('');

  const scrollToEnd = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages, sendMutation.isPending]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || sendMutation.isPending) return;

    const userMsg: ChatMessage = { id: makeId(), role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');

    const moodContext = buildMoodContext(recentQuery.data ?? []);
    sendMutation.mutate(
      { messages: nextMessages, moodContext },
      {
        onSuccess: (reply) => {
          setMessages((prev) => [
            ...prev,
            { id: makeId(), role: 'assistant', content: reply },
          ]);
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại nhé.';
          setMessages((prev) => [
            ...prev,
            { id: makeId(), role: 'assistant', content: `⚠️ ${msg}` },
          ]);
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Bloom 🌿</Text>
          <Text style={styles.headerSub}>Người bạn đồng hành cảm xúc</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
        >
          <Text style={styles.disclaimer}>
            Bloom là người bạn đồng hành, không thay thế chuyên gia tâm lý.
          </Text>

          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.bubbleRow,
                m.role === 'user' ? styles.rowUser : styles.rowAssistant,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    m.role === 'user' ? styles.textUser : styles.textAssistant,
                  ]}
                >
                  {m.content}
                </Text>
              </View>
            </View>
          ))}

          {sendMutation.isPending ? (
            <View style={[styles.bubbleRow, styles.rowAssistant]}>
              <View style={[styles.bubble, styles.bubbleAssistant, styles.typing]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>Bloom đang trả lời…</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Nhắn cho Bloom…"
            placeholderTextColor={colors.text.secondary}
            style={styles.input}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            style={[
              styles.sendBtn,
              (!input.trim() || sendMutation.isPending) && styles.sendBtnDisabled,
            ]}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  headerSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  messages: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },
  disclaimer: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  bubbleRow: { flexDirection: 'row' },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.cream,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  textUser: { color: colors.white },
  textAssistant: { color: colors.text.primary },
  typing: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  typingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
