// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);
  const [realtimeEvents, setRealtimeEvents] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Socket.IO connection
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    if (user && (user.user_id || user.id)) {
      const uId = user.user_id || user.id;
      newSocket.emit('join-room', `user_${uId}`);
      newSocket.emit('join-room', `role_${user.role_name}`);
    }

    newSocket.on('notification', (data) => {
      setNotifications(prev => [data, ...prev]);
      if (data.message) {
        toast.info(`🔔 ${data.message}`);
      }
    });

    // 2. SSE (Server-Sent Events) connection for Cloud SQL real-time updates
    const eventSource = new EventSource('/api/realtime/stream');

    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed.type && parsed.type !== 'CONNECTED') {
          setLastEvent(parsed);
          setRealtimeEvents(prev => [...prev, parsed]);
          if (parsed.type === 'STUDY_ASSIGNED') {
            toast.info(`📋 Study ${parsed.data?.study_code || ''} assigned to Radiologist`);
          } else if (parsed.type === 'REPORT_APPROVED') {
            toast.success(`✅ Report ${parsed.data?.report_number || ''} officially approved!`);
          } else if (parsed.type === 'STUDY_CREATED') {
            toast.info(`🆕 New USG Study registered: ${parsed.data?.study_code || ''}`);
          }
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    return () => {
      newSocket.disconnect();
      eventSource.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, lastEvent, realtimeEvents }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext) || { socket: null, notifications: [], lastEvent: null, realtimeEvents: [] };
