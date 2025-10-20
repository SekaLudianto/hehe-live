
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, ConnectionState, GiftMessage, LikeMessage, RoomUserMessage, SocialMessage } from '../types';

const BACKEND_URL = "http://localhost:8081";

export const useTikTok = () => {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const [latestChatMessage, setLatestChatMessage] = useState<ChatMessage | null>(null);
  const [latestGiftMessage, setLatestGiftMessage] = useState<GiftMessage | null>(null);
  const [latestLikeMessage, setLatestLikeMessage] = useState<LikeMessage | null>(null);
  const [latestSocialMessage, setLatestSocialMessage] = useState<SocialMessage | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUserMessage | null>(null);
  const [totalDiamonds, setTotalDiamonds] = useState<number>(0);
  
  useEffect(() => {
    socket.current = io(BACKEND_URL);

    socket.current.on('connect', () => {
      console.log('Socket connected!');
    });
    
    socket.current.on('disconnect', () => {
        console.warn('Socket disconnected!');
        setIsConnected(false);
        setConnectionState(null);
        setIsConnecting(false);
    });
    
    socket.current.on('streamEnd', () => {
        setIsConnected(false);
        setConnectionState(null);
        setErrorMessage('Stream ended.');
        setIsConnecting(false);
    });

    socket.current.on('tiktokConnected', (state: ConnectionState) => {
      console.log('TikTok Connected:', state);
      setConnectionState(state);
      setIsConnected(true);
      setErrorMessage(null);
      setIsConnecting(false);
      setTotalDiamonds(0);
    });

    socket.current.on('tiktokDisconnected', (reason: string) => {
      console.warn('TikTok Disconnected:', reason);
      setIsConnected(false);
      setConnectionState(null);
      setErrorMessage(reason);
      setIsConnecting(false);
    });

    socket.current.on('chat', (msg: ChatMessage) => setLatestChatMessage(msg));
    socket.current.on('gift', (msg: GiftMessage) => {
        if (msg.giftType === 1 && !msg.repeatEnd) {
            // Streak gift, wait for it to end
        } else {
            setTotalDiamonds(prev => prev + msg.diamondCount * msg.repeatCount);
        }
        setLatestGiftMessage(msg);
    });
    socket.current.on('like', (msg: LikeMessage) => setLatestLikeMessage(msg));
    socket.current.on('social', (msg: SocialMessage) => setLatestSocialMessage(msg));
    socket.current.on('roomUser', (msg: RoomUserMessage) => setRoomUsers(msg));

    return () => {
      socket.current?.disconnect();
    };
  }, []);
  
  const connect = useCallback((uniqueId: string) => {
    if (socket.current && uniqueId) {
      setIsConnecting(true);
      setErrorMessage(null);
      socket.current.emit('setUniqueId', uniqueId, { enableExtendedGiftInfo: true });
    }
  }, []);

  return {
    isConnected,
    isConnecting,
    connectionState,
    errorMessage,
    connect,
    latestChatMessage,
    latestGiftMessage,
    latestLikeMessage,
    latestSocialMessage,
    roomUsers,
    totalDiamonds
  };
};
