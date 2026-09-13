import { supabase } from "@/lib/supabase";

const PUBLIC_VAPID_KEY =
  "BNx36HoFOu3Y4YFo1Ga1-ud8Ax6EXQUZz2QOfM9SLh3V1CqSRijJnqHX5sLCopY27ZV1X1hkX3IKwh_TNI50zms";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0)),
  );
};

export const subscribeToPushNotifications = async () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error(
      "Push notifications are not supported by this browser.",
    );
  }

  if (!("PushManager" in window)) {
    throw new Error(
      "Push notifications are not supported by this browser.",
    );
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.ready;

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });
  }

  const {
  data: { session },
  error: sessionError,
} = await supabase.auth.getSession();

if (sessionError) {
  throw sessionError;
}

const user = session?.user;

if (!user) {
  throw new Error("You must be logged in to enable notifications.");
}

  const subscriptionJson = subscription.toJSON();

  const endpoint = subscriptionJson.endpoint;

  const p256dh = subscriptionJson.keys?.p256dh;
  const auth = subscriptionJson.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    throw new Error(
      "Could not read the push subscription.",
    );
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,endpoint",
      },
    );

  if (error) {
    throw error;
  }

  return subscription;
};

export const unsubscribeFromPushNotifications = async () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const endpoint = subscription.endpoint;

  await subscription.unsubscribe();

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    throw error;
  }
};