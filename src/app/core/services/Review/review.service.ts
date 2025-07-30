import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Ireview } from '../../models/ireview';
import { AddReviewByGuestDTO } from '../../models/ReviewInterfaces/add-review-by-guest-dto';
import { EditReviewByGuestDTO, IGuestReviewDto } from '../../models/ReviewInterfaces/guest-review-dto';
import { environment } from '../../../../environments/environment.development';
import { BookingDetailsDTO } from '../Booking/user-booking-service';
@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  baseUrl: string = `${environment.baseUrl}/Review`;
  // Use environment baseUrl instead of hardcoded URLs
  private reviewURL = `${environment.baseUrl}/Review`;
  private bookingURL = `${environment.baseUrl}/Booking`;

  constructor(private http: HttpClient) {}

  getAllReviews(): Observable<IGuestReviewDto[]> {
    return this.http.get<any>(`${this.baseUrl}/all`).pipe(
      map((response) => {
        if (!response.isSuccess || !response.data) {
          return [];
        }
        return response.data;
      })
    );
  }

  getReviewById(id: number): Observable<IGuestReviewDto> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map((response) => {
        if (!response.isSuccess || !response.data) {
          throw new Error(response.message || 'Failed to get review');
        }
        return response.data;
      })
    );
  }

  getReviewsByUserId(userId: string): Observable<IGuestReviewDto[]> {
    return this.http.get<any>(`${this.baseUrl}/user/${userId}`).pipe(
      map((response) => {
        if (!response.isSuccess || !response.data) {
          return [];
        }
        return response.data;
      })
    );
  }

  getReviewsByPropertyId(propertyId: number): Observable<IGuestReviewDto[]> {
    return this.http.get<any>(`${this.baseUrl}/property/${propertyId}`).pipe(
      map((response) => {
        if (!response.isSuccess || !response.data) {
          return [];
        }
        return response.data;
      })
    );
  }

  addReview(review: AddReviewByGuestDTO): Observable<AddReviewByGuestDTO> {
    return this.http.post<any>(`${this.baseUrl}`, review).pipe(
      map((response) => {
        if (!response.isSuccess || !response.data) {
          throw new Error(response.message || 'Failed to add review');
        }
        return response.data;
      })
    );
  }

  updateReview(id: number, review: AddReviewByGuestDTO  ): Observable<AddReviewByGuestDTO> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, review).pipe(
      map((response) => {
        if (!response.isSuccess || !response.data) {
          throw new Error(response.message || 'Failed to update review');
        }
        return response.data;
      })
    );
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      map((response) => {
        if (!response.isSuccess) {
          throw new Error(response.message || 'Failed to delete review');
        }
        return;
      })
    );
  }

  getUserCompletedBookingsForProperty(
    userId: string,
    propertyId: number
  ): Observable<BookingDetailsDTO[]> {
    // Use the bookingURL to get user bookings for a specific property
    return this.http
      .get<any>(
        `${this.bookingURL}/PropertyBooking/${propertyId}/user/${userId}`
      )
      .pipe(
        map((response) => {
          if (!response.isSuccess || !response.data) {
            return [];
          }
          // Filter only completed bookings
          return response.data.filter(
            (booking: BookingDetailsDTO) =>
              booking.bookingStatus === 'Completed'
          );
        })
      );
  }
}
