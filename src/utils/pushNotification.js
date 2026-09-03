import { deleteData, postData } from "./api";

const DEVICE_ID_STORAGE_KEY = "pushDeviceId";
const SUBSCRIPTION_ID_STORAGE_KEY = "pushSubscriptionId";

export const getStoredPushSubscriptionId = () =>
  localStorage.getItem(SUBSCRIPTION_ID_STORAGE_KEY);

export const isPushNotificationSupported = () =>
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
    throw new Error("Trình duyệt không hỗ trợ thông báo đẩy");
  }
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) throw new Error("Thiếu cấu hình VAPID public key");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Bạn chưa cấp quyền thông báo cho ứng dụng");
  }

  const registration = await getRegistration();
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
    });
  }

  const response = await postData("/auth/push-subscriptions", {
    deviceId: getOrCreateDeviceId(),
    subscription: subscription.toJSON(),
  });
  localStorage.setItem(
    SUBSCRIPTION_ID_STORAGE_KEY,
    response.data.subscriptionId,
  );
};

export const disablePushNotifications = async () => {
  if (!isPushNotificationSupported()) return;
  const registration = await getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  const subscriptionId = localStorage.getItem(SUBSCRIPTION_ID_STORAGE_KEY);

  if (subscriptionId) {
    await deleteData(`/auth/push-subscriptions/${subscriptionId}`);
  }
  if (subscription) await subscription.unsubscribe();
  localStorage.removeItem(SUBSCRIPTION_ID_STORAGE_KEY);
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
