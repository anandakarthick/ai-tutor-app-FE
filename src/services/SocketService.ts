/**
 * Socket.IO Service
 * Real-time communication with backend
 */

import {io, Socket} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG, STORAGE_KEYS} from './api';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  /**
   * Initialize socket connection
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      this.socket = io(API_CONFIG.SOCKET_URL, {
        auth: {token},
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupListeners();
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  /**
   * Setup event listeners
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    // Handle reconnection
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔌 Socket reconnected after', attemptNumber, 'attempts');
    });
  }

  /**
   * Join a room (e.g., learning session, chat)
   */
  joinRoom(room: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot join room');
      return;
    }
    this.socket.emit('join_room', room);
    console.log('Joined room:', room);
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('leave_room', room);
    console.log('Left room:', room);
  }

  /**
   * Send a message in a learning session
   */
  sendMessage(sessionId: string, message: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('learning_message', {sessionId, message});
  }

  /**
   * Subscribe to AI responses
   */
  onAiResponse(callback: (data: any) => void): void {
    this.socket?.on('ai_response', callback);
  }

  /**
   * Subscribe to session updates
   */
  onSessionUpdate(callback: (data: any) => void): void {
    this.socket?.on('session_update', callback);
  }

  /**
   * Subscribe to notifications
   */
  onNotification(callback: (data: any) => void): void {
    this.socket?.on('notification', callback);
  }

  /**
   * Subscribe to progress updates
   */
  onProgressUpdate(callback: (data: any) => void): void {
    this.socket?.on('progress_update', callback);
  }

  /**
   * Subscribe to quiz updates
   */
  onQuizUpdate(callback: (data: any) => void): void {
    this.socket?.on('quiz_update', callback);
  }

  /**
   * Remove specific event listener
   */
  off(event: string): void {
    this.socket?.off(event);
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected manually');
    }
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected && !!this.socket?.connected;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
