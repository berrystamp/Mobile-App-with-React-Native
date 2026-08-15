export const ENV = {
  BASE_URL: "https://backend-dev-api.berrystamp.com",
  // STOMP WebSocket endpoint — the backend exposes SockJS/STOMP at /ws
  WS_URL: "wss://backend-dev-api.berrystamp.com/api/v1/ws",
  TIMEOUT: 15000,
  // Paystack — replace with your real public key from https://dashboard.paystack.com/#/settings/developers
  PAYSTACK_PUBLIC_KEY: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
};
