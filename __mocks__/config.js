export default {
    WebSocketUrl: process.env.EXPO_PUBLIC_WEBSOCKET_URL ?? "ws://mock:8080",
    LocalHostAPI: process.env.EXPO_PUBLIC_API_URL ?? "http://mock:3000/api",
  };