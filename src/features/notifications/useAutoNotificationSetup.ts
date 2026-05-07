import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { applyEnabledSlots, REMINDER_SLOTS } from './scheduler';

const SETUP_FLAG = 'notifications.auto-setup.done';

/**
 * Auto-request notification permission khi app start. Nếu granted, schedule 5 reminders mặc định.
 * Idempotent: chỉ request lần đầu (sau đó iOS không show prompt nữa nếu user đã quyết).
 *
 * Pattern giống hầu hết apps: install xong → iOS prompt → user choose → app behave theo.
 * Không có UI toggle trong app — user manage qua iOS Settings → App.
 */
export function useAutoNotificationSetup() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Setup Android channel (no-op trên iOS)
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Daily reminders',
            importance: Notifications.AndroidImportance.DEFAULT,
            sound: 'default',
          });
        }

        const { status: existing } = await Notifications.getPermissionsAsync();

        if (existing === 'undetermined') {
          // First time → iOS shows native permission prompt
          const { status } = await Notifications.requestPermissionsAsync();
          if (cancelled) return;
          if (status === 'granted') {
            await applyEnabledSlots([...REMINDER_SLOTS]);
          }
        } else if (existing === 'granted') {
          // Đã granted từ session trước → đảm bảo 5 reminders đang scheduled
          // (cancel + reschedule để idempotent, tránh duplicate scheduled)
          const setupDone = await AsyncStorage.getItem(SETUP_FLAG);
          if (!setupDone) {
            await applyEnabledSlots([...REMINDER_SLOTS]);
          }
        }
        // existing === 'denied': do nothing, user phải bật manual qua iOS Settings

        await AsyncStorage.setItem(SETUP_FLAG, '1');
      } catch (err) {
        // Silent — notification không quan trọng đến mức crash app
        console.warn('[notifications setup]', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
