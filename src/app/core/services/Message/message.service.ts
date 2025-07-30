import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Observable, map } from 'rxjs';
import { Property } from '../../models/Property';

export interface Result<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

export interface ChatSessionDto {
  id: string;
  propertyId: number;
  propertyTitle: string;
  propertyImageUrl: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  hostId: string;
  hostName: string;
  hostAvatarUrl: string;
  lastActivityAt: string;
  lastMessageText: string;
  unreadCount: number;
  hasPendingRequests: boolean;
  isActive: boolean;
}

export interface ReactionUser {
  id: string;
  userName: string;
  avatarUrl: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  reactionType: number;
  users: ReactionUser[];
  count: number;
  hasCurrentUserReacted: boolean;
}

export interface ReservationRequest {
  id: string;
  chatSessionId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  requestStatus: number;
  requestedAt: string;
  respondedAt: string | null;
  responseMessage: string | null;
  nightCount: number;
  pricePerNight: number;
}

export interface MessageDto {
  id: string;
  chatSessionId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  messageText: string;
  messageType: string;
  createdAt: string;
  isEdited: boolean;
  editedAt: string | null;
  isHost: boolean;
  isOwnMessage: boolean;
  isRead: boolean;
  reactions: MessageReaction[];
  reservationRequest: ReservationRequest | null;
}

export interface SendMessageRequest {
  chatSessionId: string;
  messageText: string;
  messageType: number;
}

export interface ReservePropertyRequest {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  message: string;
   hostId: string;
}

export interface User {
  userId: string | null;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  bio: string;
  birthDate: string;
  country: string;
  profilePictureURL: string;
}

export interface PropertyImage {
  id: number;
  groupName: string;
  propertyId: number;
  imageUrl: string;
  isCover: boolean;
  isDeleted: boolean;
}

export interface ReservationRequestWithUser extends ReservationRequest {
  userId: string;
  user: User;
}

export interface ReservePropertyResponse {
  latestReservationRequest: ReservationRequestWithUser;
  chatSession: ChatSessionDto;
  proeprty: Property;
  messages: MessageDto[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly baseUrl = environment.baseUrl + '/chat';

  constructor(private http: HttpClient) {}

  // Get user chat sessions with pagination
  getChatSessions(page: number = 1, pageSize: number = 20): Observable<ChatSessionDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<ChatSessionDto[]>(`${this.baseUrl}/sessions`, { params });
  }

  // Create or get existing chat session for a property
  createOrGetChatSession(propertyId: number): Observable<Result<ChatSessionDto>> {
    return this.http.post<Result<ChatSessionDto>>(`${this.baseUrl}/sessions`, propertyId);
  }

  // Get messages for a specific chat session with pagination
  getChatMessages(
    chatSessionId: string,
    page: number = 1,
    pageSize: number = 50
  ): Observable<MessageDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<MessageDto[]>(`${this.baseUrl}/sessions/${chatSessionId}/messages`, { params });
  }

  // Send a message in a chat session
  sendMessage(chatSessionId: string, messageText: string, messageType: number = 1, isUser: boolean = true): Observable<MessageDto> {
    const request: SendMessageRequest = {
      chatSessionId,
      messageText,
      messageType
    };

    const params = new HttpParams().set('isUser', isUser.toString());

    return this.http
      .post<MessageDto>(`${this.baseUrl}/sessions/${chatSessionId}/messages`, request, { params });
  }

  // Mark messages as read in a chat session
  markMessagesAsRead(chatSessionId: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/sessions/${chatSessionId}/mark-read`, {});
  }

  // Reserve a property (creates chat session and reservation request)   rawan use this 
  reserveProperty(request: ReservePropertyRequest): Observable<Result<ReservePropertyResponse>> {
    return this.http.post<Result<ReservePropertyResponse>>(`${this.baseUrl}/reserve`, request);
  }



  //     this.http.post<{ data: { checkoutUrl: string } }>('/api/payment/create-checkout-session', checkoutRequest)
  // .subscribe(res => {
  //   window.location.href = res.data.checkoutUrl; // this is Stripe’s URL
  // });
  
}
