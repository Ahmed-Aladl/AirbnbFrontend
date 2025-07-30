import { Component, OnInit } from '@angular/core';
import { UserBookingService, BookingDetailsDTO } from '../../../core/services/Booking/user-booking-service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../../../components/header/header";
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-user-bookings',
  templateUrl: './userbookings.html',
  styleUrls: ['./userbookings.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  providers: [DatePipe]
})
export class UserBookings implements OnInit {
  bookings: BookingDetailsDTO[] = [];
  isLoading = true;
  error: string | null = null;

  private userId: string | null = null;

  private readonly currentDate = new Date();

  
  // private readonly userId = '9a4e2846-8058-4458-badd-6cf601405ae2';

  constructor(
    private userBookingService: UserBookingService,
    private datePipe: DatePipe,
    private authService: AuthService  

  ) { }

  ngOnInit(): void {
    this.loadUserBookings();
  }

  loadUserBookings(): void {
  this.isLoading = true;
  this.error = null;

  this.userId = this.authService.userId;

  if (!this.userId) {
    this.error = 'User ID is not available.';
    this.isLoading = false;
    return;
  }

  this.userBookingService.getBookingsByUserId(this.userId).subscribe({
    next: (bookings) => {
      this.bookings = this.sortBookings(bookings);
      this.isLoading = false;
    },
    error: (err) => {
      this.error = err.message;
      this.isLoading = false;
      console.error('Error loading bookings:', err);
    }
  });
}

  private sortBookings(bookings: BookingDetailsDTO[]): BookingDetailsDTO[] {
    return bookings.sort((a, b) => {
      return new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime();
    });
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return this.datePipe.transform(date, 'MMM d, yyyy') || dateString;
    } catch {
      return dateString;
    }
  }

  formatShortDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return this.datePipe.transform(date, 'MMM d') || dateString;
    } catch {
      return dateString;
    }
  }

  // New method to format dates with year
  formatDateWithYear(dateString: string): string {
    try {
      const date = new Date(dateString);
      return this.datePipe.transform(date, 'MMM d, yyyy') || dateString;
    } catch {
      return dateString;
    }
  }

  formatShortDateWithYear(dateString: string): string {
    try {
      const date = new Date(dateString);
      return this.datePipe.transform(date, 'MMM d, yy') || dateString;
    } catch {
      return dateString;
    }
  }

  getBookingStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'status-completed',
      'confirmed': 'status-confirmed',
      'pending': 'status-pending',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status.toLowerCase()] || 'status-default';
  }

  getBookingStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'completed': 'bi-check-circle-fill',
      'confirmed': 'bi-calendar-check-fill',
      'pending': 'bi-clock-fill',
      'cancelled': 'bi-x-circle-fill'
    };
    return iconMap[status.toLowerCase()] || 'bi-circle-fill';
  }

  isUpcomingBooking(checkInDateString: string): boolean {
    try {
      const checkInDate = new Date(checkInDateString);
      return checkInDate > this.currentDate;
    } catch {
      return false;
    }
  }

  isPastBooking(checkOutDateString: string): boolean {
    try {
      const checkOutDate = new Date(checkOutDateString);
      return checkOutDate < this.currentDate;
    } catch {
      return false;
    }
  }

  getBookingTypeLabel(booking: BookingDetailsDTO): string {
    if (this.isUpcomingBooking(booking.checkInDate)) {
      return 'Upcoming';
    } else if (this.isPastBooking(booking.checkOutDate)) {
      return 'Past';
    } else {
      return 'Current';
    }
  }

  getNightCount(checkIn: string, checkOut: string): number {
    try {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    } catch {
      return 0;
    }
  }

  refreshBookings(): void {
    this.loadUserBookings();
  }

  trackByBookingId(index: number, booking: BookingDetailsDTO): number {
    return booking.id;
  }

  getPricePerNight(totalPrice: number, checkIn: string, checkOut: string): number {
    const nights = this.getNightCount(checkIn, checkOut);
    return nights > 0 ? totalPrice / nights : 0;
  }
}  



