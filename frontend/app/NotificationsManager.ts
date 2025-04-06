// NotificationsManager.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up notification handler (this can also be in your main app file)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Schedule a local notification after a specified delay (in seconds).
 * @param delaySeconds Number of seconds to wait before triggering the notification.
 * @param message The notification message to display.
 */
export async function scheduleLocalNotification(delaySeconds: number, message: string) {
  // Skip scheduling notifications on web.
  if (Platform.OS === 'web') {
    console.warn("Local notifications are not supported on web.");
    return;
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ReflectIn Reminder',
      body: message,
    },
    trigger: { seconds: delaySeconds },
  });
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications() {
  // On web, there's nothing to cancel.
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
