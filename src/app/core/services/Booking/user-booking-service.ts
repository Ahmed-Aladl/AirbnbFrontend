import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface BookingDetailsDTO {
  id: number;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  bookingStatus: string;
  propertyId: number;
  propertyTitle: string;
  city: string;
  country: string;
}

interface ApiResponse {
  data: BookingDetailsDTO[];
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserBookingService {
  private readonly apiUrl = `${environment.baseUrl}/Booking`;

  constructor(private http: HttpClient) {}

  getBookingsByUserId(userId: string): Observable<BookingDetailsDTO[]> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/UserBooking/${userId}`).pipe(
      map(response => {
        if (!response.isSuccess || !response.data) {
          return [];
        }
        return response.data;
      }),
      catchError(error => {
        console.error('API Error:', error);
        
        if (error.status === 404) {
          return of([]);
        }

        return throwError(() => new Error(
          error.error?.message ||
          error.message ||
          'Failed to load bookings. Please try again later.'
        ));
      })
    );
  }
}
