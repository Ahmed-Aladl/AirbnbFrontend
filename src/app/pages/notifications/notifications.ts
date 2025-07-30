import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/Notification/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../../core/models/Notification';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Loader } from "../../shared/components/loader/loader";

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, TranslateModule, Loader],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscriptions: Subscription = new Subscription();
  loading = false;
  error: string | null = null;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.subscribeToNewNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.notificationService.stopConnection();
  }

  private loadNotifications(): void {
    const userId = this.authService.userId || '';
    const token = this.authService.accessToken || '';

    console.log(userId, token);
    // if (!userId || !token) {
    //   this.error = 'User not authenticated';
    //   return;
    // }

    this.loading = true;
    this.error = null;

    // Start SignalR connection
    this.notificationService.startConnection(token);

    // Load existing notifications
    const notificationsSub = this.notificationService.getNotificationsByUserId(userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.error = 'Failed to load notifications';
        this.loading = false;
      }
    });

    this.subscriptions.add(notificationsSub);
  }

  private subscribeToNewNotifications(): void {
    const newNotificationSub = this.notificationService.newNotification$.subscribe((msgOrNotification) => {
      if (typeof msgOrNotification === 'string') {
        const newNotification: Notification = {
          userId: this.authService.userId || '',
          message: msgOrNotification,
          isRead: false,
          createdAt: new Date()
        };
        this.notifications.unshift(newNotification);
      } else {
        this.notifications.unshift(msgOrNotification);
      }
    });

    this.subscriptions.add(newNotificationSub);
  }

  markAsRead(notification: Notification): void {
    if (!notification.id || notification.isRead) return;

    const markReadSub = this.notificationService.setNotificationRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
      },
      error: (err) => {
        console.error('Error marking notification as read:', err);
      }
    });

    this.subscriptions.add(markReadSub);
  }

  deleteNotification(notification: Notification): void {
    if (!notification.id) return;

    const deleteSub = this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
      },
      error: (err) => {
        console.error('Error deleting notification:', err);
      }
    });

    this.subscriptions.add(deleteSub);
  }

  markAllAsRead(): void {
    const unreadNotifications = this.notifications.filter(n => !n.isRead && n.id);

    unreadNotifications.forEach(notification => {
      if (notification.id) {
        this.markAsRead(notification);
      }
    });
  }

  clearAllNotifications(): void {
    const notificationsWithId = this.notifications.filter(n => n.id);

    notificationsWithId.forEach(notification => {
      if (notification.id) {
        this.deleteNotification(notification);
      }
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getFormattedDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }
}
