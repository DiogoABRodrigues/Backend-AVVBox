import { Expo } from 'expo-server-sdk';
const expo = new Expo();

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string
) {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error('Token inválido:', expoPushToken);
    return;
  }

  const messages = [{
    to: expoPushToken,
    sound: 'default',  // toca som e vibração
    title,
    body,
  }];

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error(error);
    }
  }
}
