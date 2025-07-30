import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface BookingDetailsDTO {
  id: number;
  userId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  userCountry?: string;
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

export interface BookingApiResponse {
  data: BookingDetailsDTO[];
  success?: boolean;
  message?: string;
}
      // use in reserve box in property info
export interface BookingDTO {
  userId: string;
  propertyId: number;
  checkInDate: string; 
  checkOutDate: string;
  numberOfGuests: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly apiUrl = `${environment.baseUrl}/Booking`;

  constructor(private http: HttpClient) {}

  getAllBookings(): Observable<BookingDetailsDTO[]> {
    return this.http.get<BookingApiResponse>(`${this.apiUrl}`).pipe(
      map(response => {
        console.log('API Response:', response); // Debug log
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  getBookingById(bookingId: number): Observable<BookingDetailsDTO> {
    return this.http.get<BookingDetailsDTO>(`${this.apiUrl}/${bookingId}`);
  }

  getBookingsByUserId(userId: string): Observable<BookingDetailsDTO[]> {
    return this.http.get<BookingApiResponse>(`${this.apiUrl}/UserBooking/${userId}`).pipe(
      map(response => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }



      // rawan 
  createBooking(booking: BookingDTO): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}`, booking);
}




}