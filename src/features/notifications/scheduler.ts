import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/** 5 khung giờ nhắc log mood. Hour theo 24h. */
export const REMINDER_SLOTS = [9, 12, 15, 18, 21] as const;
export type ReminderHour = (typeof REMINDER_SLOTS)[number];

const STORAGE_KEY = 'reminders.enabled.slots';

const SLOT_MESSAGES: Record<ReminderHour, { title: string; body: string }> = {
  9: { title: '🌅 Good morning!', body: 'Bắt đầu ngày mới — hôm nay cảm xúc thế nào?' },
  12: { title: '🌞 Lunch check-in', body: 'Một nửa ngày trôi rồi — note lại cảm xúc nhé.' },
  15: { title: '☕ Afternoon vibe', body: 'Bạn đang cảm thấy thế nào lúc này?' },
  18: { title: '🌇 Evening time', body: 'Ngày dần khép lại — log mood cho cây hoa hôm nay.' },
  21: { title: '🌙 Before bed', body: 'Tổng kết ngày: cảm xúc + 1 ghi chú nhỏ.' },
};

/**
 * Set handler một lần — quyết định notification hiển thị thế nào khi app đang foreground.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Daily reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getEnabledSlots(): Promise<ReminderHour[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as number[];
    return arr.filter((n): n is ReminderHour => REMINDER_SLOTS.includes(n as ReminderHour));
  } catch {
    return [];
  }
}

async function saveEnabledSlots(slots: ReminderHour[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

/**
 * Cancel tất cả scheduled reminders trước khi reschedule lại theo state mới.
 */
async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function scheduleSlot(hour: ReminderHour): Promise<void> {
  const msg = SLOT_MESSAGES[hour];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: 'default',
      data: { hour, type: 'mood-reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
}

/**
 * Public API: set danh sách slots active. Cancel tất cả + reschedule theo input.
 * Gọi mỗi khi user toggle 1 slot.
 */
export async function applyEnabledSlots(slots: ReminderHour[]): Promise<void> {
  await cancelAllReminders();
  for (const hour of slots) {
    await scheduleSlot(hour);
  }
  await saveEnabledSlots(slots);
}

/**
 * Disable all (toggle master OFF).
 */
export async function disableAllReminders(): Promise<void> {
  await cancelAllReminders();
  await saveEnabledSlots([]);
}

/**
 * Default = enable cả 5 slots khi user bật master lần đầu.
 */
export async function enableDefaultSlots(): Promise<void> {
  await applyEnabledSlots([...REMINDER_SLOTS]);
}
