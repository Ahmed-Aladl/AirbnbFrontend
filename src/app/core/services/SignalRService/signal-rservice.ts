import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MessageDto } from '../Message/message.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private connection!: HubConnection;
  private readonly hubUrl = 'https://localhost:7025/chatHub';

  // Connection status
  private connectionStatusSubject = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  // Message events
  private messageReceivedSubject = new Subject<MessageDto>();
  public messageReceived$ = this.messageReceivedSubject.asObservable();

  // Error events
  private errorSubject = new Subject<string>();
  public error$ = this.errorSubject.asObservable();

  constructor() {
    this.buildConnection();
  }

  private buildConnection(): void {
    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, { withCredentials: true })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry intervals
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Message received event
    this.connection.on('ReceiveMessage', (messageDto: MessageDto) => {
      console.log('SignalR - Message received:', messageDto);
      this.messageReceivedSubject.next(messageDto);
    });

    // Connection events
    this.connection.onclose((error) => {
      console.log('SignalR - Connection closed:', error);
      this.connectionStatusSubject.next(HubConnectionState.Disconnected);
      if (error) {
        this.errorSubject.next(`Connection closed: ${error.message}`);
      }
    });

    this.connection.onreconnecting((error) => {
      console.log('SignalR - Reconnecting:', error);
      this.connectionStatusSubject.next(HubConnectionState.Reconnecting);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR - Reconnected:', connectionId);
      this.connectionStatusSubject.next(HubConnectionState.Connected);
    });
  }

  public async startConnection(): Promise<void> {
    if (this.connection.state === HubConnectionState.Disconnected) {
      try {
        await this.connection.start();
        console.log('SignalR - Connected successfully');
        this.connectionStatusSubject.next(HubConnectionState.Connected);
      } catch (error: any) {
        console.error('SignalR - Connection error:', error);
        this.connectionStatusSubject.next(HubConnectionState.Disconnected);
        this.errorSubject.next(`Connection failed: ${error.message}`);
        throw error;
      }
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.stop();
        console.log('SignalR - Connection stopped');
        this.connectionStatusSubject.next(HubConnectionState.Disconnected);
      } catch (error: any) {
        console.error('SignalR - Stop connection error:', error);
        this.errorSubject.next(`Stop connection failed: ${error.message}`);
      }
    }
  }

  // public async joinChatSession(chatSessionId: string): Promise<void> {
  //   if (this.connection.state === HubConnectionState.Connected) {
  //     try {
  //       await this.connection.invoke('JoinChatSession', chatSessionId);
  //       console.log('SignalR - Joined chat session:', chatSessionId);
  //     } catch (error: any) {
  //       console.error('SignalR - Join chat session error:', error);
  //       this.errorSubject.next(`Join chat session failed: ${error.message}`);
  //     }
  //   }
  // }

  // public async leaveChatSession(chatSessionId: string): Promise<void> {
  //   if (this.connection.state === HubConnectionState.Connected) {
  //     try {
  //       await this.connection.invoke('LeaveChatSession', chatSessionId);
  //       console.log('SignalR - Left chat session:', chatSessionId);
  //     } catch (error: any) {
  //       console.error('SignalR - Leave chat session error:', error);
  //       this.errorSubject.next(`Leave chat session failed: ${error.message}`);
  //     }
  //   }
  // }

  public isConnected(): boolean {
    return this.connection.state === HubConnectionState.Connected;
  }

  public getConnectionState(): HubConnectionState {
    return this.connection.state;
  }

  // Clean up
  public destroy(): void {
    if (this.connection) {
      this.stopConnection();
      this.messageReceivedSubject.complete();
      this.connectionStatusSubject.complete();
      this.errorSubject.complete();
    }
  }
}
