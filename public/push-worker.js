self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = typeof payload.title === "string" ? payload.title : "Tin nhắn mới";
  const options = {
    body: typeof payload.body === "string" ? payload.body : "Bạn có một cập nhật mới",
    icon: "/vite.svg",
    badge: "/vite.svg",
    tag: typeof payload.tag === "string" ? payload.tag : "chat-update",
    data: {
      url:
        typeof payload.url === "string" && payload.url.startsWith("/")
          ? payload.url
          : "/chat",
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/chat", self.location.origin);
  if (targetUrl.origin !== self.location.origin) return;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => "focus" in client);
      if (existing) {
        existing.navigate(targetUrl.href);
        return existing.focus();
      }
      return self.clients.openWindow(targetUrl.href);
    }),
  );
});
