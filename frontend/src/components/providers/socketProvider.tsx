'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

function getAuthToken() {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1] ?? null
  );
}

function createSocketStore() {
  let socket: Socket | null = null;
  let isConnected = false;
  const listeners = new Set<() => void>();

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function connect() {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) {
      console.error('NEXT_PUBLIC_SOCKET_URL is not defined');
      return;
    }

    const token = getAuthToken();

    socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: token ? { token } : undefined,
    });

    socket.on('connect', () => {
      isConnected = true;
      emit();
    });

    socket.on('disconnect', () => {
      isConnected = false;
      emit();
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message);
    });
  }

  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    isConnected = false;
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!socket) {
        connect();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          disconnect();
        }
      };
    },
    getSnapshot(): SocketContextType {
      return { socket, isConnected };
    },
  };
}

export function SocketProvider({ children }: SocketProviderProps) {
  const store = useMemo(() => createSocketStore(), []);
  const value = useSyncExternalStore(
    useCallback((listener) => store.subscribe(listener), [store]),
    () => store.getSnapshot(),
    () => store.getSnapshot(),
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
