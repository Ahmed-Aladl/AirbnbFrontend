import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, map } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Notification } from '../../models/Notification';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private hubConnection!: signalR.HubConnection;
  private baseUrl = `${environment.baseUrl}/Notification`;
  private HubUrl = `${environment.baseUrl}/notificationHub`;

  private notificationSubject = new Subject<Notification | string>();
  public newNotification$ = this.notificationSubject.asObservable();

  constructor(private http: HttpClient) {}

  public startConnection(token: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.HubUrl, {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ SignalR connected.'))
      .catch((err) => console.error('Error:', err));

    this.hubConnection.on('ReceiveNotification', (message: string) => {
      console.log('Notification Received:', message);
      this.notificationSubject.next(message);
    });
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  createNotification(payload: {
    id: string;
    message: string;
  }): Observable<Notification> {
    return this.http.post<any>(`${this.baseUrl}`, payload).pipe(
      map((response) => {
        if (!response.isSuccess || !response.data) {
          throw new Error(response.message || 'Failed to create notification');
        }
        return response.data as Notification;
      })
    );
  }

  getNotificationsByUserId(userId: string): Observable<Notification[]> {
    return this.http.get<any>(`${this.baseUrl}/${userId}`).pipe(
      map((response) => {
        if (!response.isSuccess || !response.data) {
          throw new Error(response.message || 'Failed to fetch notifications');
        }
        return response.data as Notification[];
      })
    );
  }

  setNotificationRead(id: number): Observable<void> {
    return this.http.put<any>(`${this.baseUrl}/${id}/read`, {}).pipe(
      map((response) => {
        if (!response.isSuccess) {
          throw new Error(response.message || 'Failed to mark as read');
        }
      })
    );
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      map((response) => {
        if (!response.isSuccess) {
          throw new Error(response.message || 'Failed to delete notification');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}
