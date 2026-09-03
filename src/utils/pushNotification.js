import { deleteData, postData } from "./api";

const DEVICE_ID_STORAGE_KEY = "pushDeviceId";
const SUBSCRIPTION_ID_STORAGE_KEY = "pushSubscriptionId";

export class PushNotificationError extends Error {
  constructor(code, userMessage) {
    super(code);
    this.name = "PushNotificationError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

const pushError = (code, userMessage, developerMessage) => {
  console.error(`[Web Push] ${developerMessage}`);
  return new PushNotificationError(code, userMessage);
};

export const getStoredPushSubscriptionId = () =>
  localStorage.getItem(SUBSCRIPTION_ID_STORAGE_KEY);

export const isPushNotificationSupported = () =>
  window.isSecureContext &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export const base64UrlToUint8Array = (value) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = window.atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const getOrCreateDeviceId = () => {
  const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;
  const deviceId = window.crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  return deviceId;
};

const getRegistration = async () => {
  await navigator.serviceWorker.register("/push-worker.js", { scope: "/" });
  return navigator.serviceWorker.ready;
};

export const getPushNotificationState = async () => {
  if (!isPushNotificationSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const registration = await getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? "enabled" : "disabled";
};

export const enablePushNotifications = async () => {
  if (!isPushNotificationSupported()) {
    throw pushError(
      "PUSH_UNSUPPORTED",
      "Trình duyệt hoặc kết nối hiện tại không hỗ trợ thông báo.",
      "Web Push requires a secure context, Service Worker, PushManager and Notification APIs.",
    );
  }
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw pushError(
      "PUSH_NOT_CONFIGURED",
      "Thông báo hiện chưa được cấu hình. Vui lòng thử lại sau.",
      "VITE_VAPID_PUBLIC_KEY is missing. Restart Vite after configuring it.",
    );
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new PushNotificationError(
      "PUSH_PERMISSION_DENIED",
      "Bạn đã từ chối quyền thông báo. Hãy bật lại trong cài đặt trình duyệt.",
    );
  }

  const registration = await getRegistration();
  let subscription = await registration.pushManager.getSubscription();
  let createdSubscription = false;
  if (!subscription) {
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
      });
      createdSubscription = true;
    } catch (error) {
      console.error("[Web Push] Browser subscription failed.", error);
      throw new PushNotificationError(
        "PUSH_SUBSCRIBE_FAILED",
        "Không thể bật thông báo trên trình duyệt này.",
      );
    }
  }

  try {
    const response = await postData("/auth/push-subscriptions", {
      deviceId: getOrCreateDeviceId(),
      subscription: subscription.toJSON(),
    });
    const subscriptionId = response.data?.subscriptionId;
    if (!subscriptionId) throw new Error("Missing subscription id");
    localStorage.setItem(SUBSCRIPTION_ID_STORAGE_KEY, subscriptionId);
  } catch (error) {
    if (createdSubscription) await subscription.unsubscribe().catch(() => {});
    console.error("[Web Push] Server registration failed.", error);
    throw new PushNotificationError(
      "PUSH_SERVER_SYNC_FAILED",
      "Không thể lưu cài đặt thông báo. Vui lòng thử lại sau.",
    );
  }
};

export const disablePushNotifications = async () => {
  if (!isPushNotificationSupported()) return;
  const registration = await getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  const subscriptionId = localStorage.getItem(SUBSCRIPTION_ID_STORAGE_KEY);

  let serverSynced = true;
  try {
    if (subscriptionId) {
      await deleteData(`/auth/push-subscriptions/${subscriptionId}`);
    }
  } catch (error) {
    serverSynced = false;
    console.error("[Web Push] Server unsubscribe failed.", error);
  } finally {
    if (subscription) await subscription.unsubscribe();
    localStorage.removeItem(SUBSCRIPTION_ID_STORAGE_KEY);
  }
  return { serverSynced };
};

export const clearLocalPushSubscription = async () => {
  try {
    if (isPushNotificationSupported()) {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
    }
  } finally {
    localStorage.removeItem(SUBSCRIPTION_ID_STORAGE_KEY);
  }
};
