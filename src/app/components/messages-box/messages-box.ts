import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ChatService, ChatSessionDto, MessageDto } from '../../core/services/Message/message.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { SignalRService } from '../../core/services/SignalRService/signal-rservice';
import { AuthService } from '../../core/services/auth.service'; // Add this import

interface MessageThread {
  id: string;
  profileImage: string;
  name: string;
  preview: string;
  time: string;
  tripDetails?: string;
  isUnread?: boolean;
  propertyId: number;
  hostId: string;
  userId: string;
  originalSession: ChatSessionDto; 
}

@Component({
  selector: 'app-messages-box',
  templateUrl: './messages-box.html',
  styleUrls: ['./messages-box.css'],
  imports: [CommonModule]
})
export class MessagesBoxComponent implements OnInit, OnDestroy {
  @Output() chatSessionSelected = new EventEmitter<ChatSessionDto>();
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;

  activeFilter: 'all' | 'unread' = 'all';
  messageThreads: MessageThread[] = [];
  selectedThreadId: string | null = null;
  isLoading = false;
  error: string | null = null;
  
  // Pagination properties
  currentPage = 1;
  pageSize = 20;
  hasMoreData = true;
  isLoadingMore = false;
  totalCount = 0;

  // Current user ID
  private currentUserId: string | null = null;

  private destroy$ = new Subject<void>();
  private scrollSubject = new Subject<Event>();

  constructor(
    private chatService: ChatService,
    private signalRService: SignalRService,
    private authService: AuthService 
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    // Get current user ID
    this.currentUserId = this.authService.userId;
    
    this.loadChatSessions();
    this.subscribeToNewMessages();
    this.setupScrollListener();
  }

  ngAfterViewInit(): void {
    // Setup scroll listener after view is initialized
    if (this.messagesContainer) {
      this.setupScrollListener();
    }
  }

  private setupScrollListener(): void {
    // Subscribe to scroll events with debounce
    this.scrollSubject.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.checkScrollPosition();
    });
  }

  onScroll(event: Event): void {
    this.scrollSubject.next(event);
  }

  private checkScrollPosition(): void {
    const container = this.messagesContainer?.nativeElement;
    if (!container || this.isLoadingMore || !this.hasMoreData) {
      return;
    }

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Check if user scrolled to bottom (with 100px threshold)
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom) {
      this.loadMoreMessages();
    }
  }

  private subscribeToNewMessages(): void {
    this.signalRService.messageReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe((newMessage: MessageDto) => {
        console.log('New message received in MessagesBox:', newMessage);
        this.updateThreadWithNewMessage(newMessage);
      });
  }

  private updateThreadWithNewMessage(newMessage: MessageDto): void {
    const threadIndex = this.messageThreads.findIndex(
      thread => thread.id === newMessage.chatSessionId
    );

    if (threadIndex !== -1) {
      // Update existing thread
      this.messageThreads[threadIndex] = {
        ...this.messageThreads[threadIndex],
        preview: newMessage.messageText,
        time: this.formatTime(newMessage.createdAt),
        isUnread: !newMessage.isOwnMessage // Mark as unread if not own message
      };

      // Move thread to top of list
      const updatedThread = this.messageThreads.splice(threadIndex, 1)[0];
      this.messageThreads.unshift(updatedThread);
    } else {
      // If thread doesn't exist, refresh the entire list
      this.resetAndLoadChatSessions();
    }
  }

  // Reset pagination and load first page
  resetAndLoadChatSessions(): void {
    this.currentPage = 1;
    this.messageThreads = [];
    this.hasMoreData = true;
    this.totalCount = 0;
    this.loadChatSessions();
  }

  loadChatSessions(page: number = 1, pageSize: number = 20): void {
    if (page === 1) {
      this.isLoading = true;
    } else {
      this.isLoadingMore = true;
    }
    
    this.error = null;

    this.chatService.getChatSessions(page, pageSize).subscribe({
      next: (response: any) => {
        console.log('Chat Sessions loaded:', response);
        
        // Handle different response formats
        let sessions: ChatSessionDto[] = [];
        let total = 0;
        
        if (Array.isArray(response)) {
          // If response is direct array
          sessions = response;
          total = response.length;
        } else if (response.data) {
          // If response has data property
          sessions = response.data;
          total = response.total || response.count || sessions.length;
        } else {
          sessions = [];
        }

        const newThreads = this.mapSessionsToThreads(sessions);
        
        if (page === 1) {
          // First page - replace all threads
          this.messageThreads = newThreads;
        } else {
          // Subsequent pages - append to existing threads
          this.messageThreads = [...this.messageThreads, ...newThreads];
        }

        this.totalCount = total;
        this.currentPage = page;
        
        // Check if there's more data
        this.hasMoreData = sessions.length === pageSize && this.messageThreads.length < this.totalCount;
        
        console.log('Mapped Message Threads:', this.messageThreads);
        console.log(`Page ${page} loaded. Total threads: ${this.messageThreads.length}, Has more: ${this.hasMoreData}`);
        
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (error) => {
        console.error('Error loading chat sessions:', error);
        this.error = 'Failed to load messages. Please try again.';
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  loadMoreMessages(): void {
    if (this.isLoadingMore || !this.hasMoreData) {
      return;
    }

    console.log('Loading more messages...');
    const nextPage = this.currentPage + 1;
    this.loadChatSessions(nextPage, this.pageSize);
  }

  private mapSessionsToThreads(sessions: ChatSessionDto[]): MessageThread[] {
    return sessions.map(session => {
      // Check if current user ID matches the userId in session
      // If yes, show hostName, otherwise show userName
      const displayName = this.currentUserId === session.userId 
        ? (session.hostName || 'Unknown Host')
        : (session.userName || 'Unknown User');
      
      const profileImage = this.currentUserId === session.userId
        ? (session.hostAvatarUrl || 'https://pngpix.com/images/file/placeholder-profile-icon-20tehfawxt5eihco.jpg')
        : (session.userAvatarUrl || 'https://pngpix.com/images/file/placeholder-profile-icon-20tehfawxt5eihco.jpg');

      return {
        id: session.id,
        profileImage: profileImage,
        name: displayName,
        preview: session.lastMessageText || 'No messages yet',
        time: this.formatTime(session.lastActivityAt),
        tripDetails: session.propertyTitle,
        isUnread: session.unreadCount > 0,
        propertyId: session.propertyId,
        hostId: session.hostId,
        userId: session.userId,
        originalSession: session
      };
    });
  }

  private formatTime(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  }

  setActiveFilter(filter: 'all' | 'unread'): void {
    this.activeFilter = filter;
    console.log('Filter changed to:', filter);
    // Reset pagination when filter changes
    this.resetAndLoadChatSessions();
  }

  openMessage(thread: MessageThread): void {
    console.log('Opening message thread:', thread);
    this.selectedThreadId = thread.id;

    // Emit the selected chat session to parent component
    this.chatSessionSelected.emit(thread.originalSession);
    
  }

  getFilteredMessages(): MessageThread[] {
    if (this.activeFilter === 'unread') {
      return this.messageThreads.filter(thread => thread.isUnread);
    }
    return this.messageThreads;
  }

  getUnreadMessages(): MessageThread[] {
    return this.messageThreads.filter(thread => thread.isUnread);
  }

  getUnreadCount(): number {
    return this.getUnreadMessages().length;
  }

  // Check if thread is selected
  isThreadSelected(threadId: string): boolean {
    return this.selectedThreadId === threadId;
  }

  // Method to refresh chat sessions (useful after sending messages)
  refreshChatSessions(): void {
    this.resetAndLoadChatSessions();
  }

  // Development methods for testing different states
  showMessagesState(): void {
    this.resetAndLoadChatSessions();
  }

  showEmptyState(): void {
    this.messageThreads = [];
    this.selectedThreadId = null;
    this.hasMoreData = false;
  }

  showMultipleMessagesState(): void {
    this.pageSize = 50;
    this.resetAndLoadChatSessions();
  }

  // Manual load more method for testing
  loadMoreManually(): void {
    this.loadMoreMessages();
  }

  // Get loading state info for UI
  getLoadingInfo(): string {
    if (this.isLoading) return 'Loading messages...';
    if (this.isLoadingMore) return 'Loading more messages...';
    if (!this.hasMoreData && this.messageThreads.length > 0) return 'All messages loaded';
    return '';
  }

  // TrackBy function for better performance
  trackByThreadId(index: number, thread: MessageThread): string {
    return thread.id;
  }

  // Optional: Method to scroll to top
  scrollToTop(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  // Optional: Method to scroll to specific message
  scrollToMessage(messageId: string): void {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
}