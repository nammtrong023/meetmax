'use client';

import { io as ClientIO } from 'socket.io-client';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useAuth } from './auth-provider';

type SocketContextType = {
    socket: any | null;
    isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { authToken } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const connectToWebSocket = useCallback(() => {
        const socketInstance = new (ClientIO as any)(
            process.env.NEXT_PUBLIC_WEB_SOCKET_URL,
            {
                extraHeaders: {
                    Authorization: `Bearer ${authToken?.accessToken}`,
                },
            },
        );

        socketInstance.on('connect', () => {
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [authToken?.accessToken]);

    useEffect(() => {
        if (authToken?.accessToken) {
            connectToWebSocket();
        }
    }, [authToken?.accessToken, connectToWebSocket]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
