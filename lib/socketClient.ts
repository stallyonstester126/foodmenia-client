import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  const authToken =
    token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("accessToken") || localStorage.getItem("token")
      : null);

  if (!socket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:5000";

    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      transports: ["websocket", "polling"],
      auth: { token: authToken },
      query: { token: authToken },
    });
  } else if (authToken && (!socket.auth || (socket.auth as { token?: string }).token !== authToken)) {
    socket.auth = { token: authToken };
    (socket.io.opts as { query?: Record<string, unknown> }).query = { token: authToken };
    if (!socket.connected) socket.connect();
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
