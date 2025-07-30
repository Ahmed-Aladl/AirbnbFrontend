import { Property } from './../../core/models/Property';
import { UserBookings } from './../../pages/booking/userbookings/userbookings';
import { UserBookingService } from './../../core/services/Booking/user-booking-service';
import { Confirm } from './../../shared/components/confirm/confirm';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../core/services/Review/review.service';
import { IGuestReviewDto } from './../../core/models/ReviewInterfaces/guest-review-dto';

import {
  ChangeDetectorRef,
  Component,
  input,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StarComponent } from '../../shared/components/star-component/star-component';

import { AuthService } from '../../core/services/auth.service';
import { BookingDetailsDTO } from '../../core/services/Booking/user-booking-service';

import { Button } from '../../shared/components/button/button';
import { ConfirmService } from '../../core/services/confirm.service';
import { Modal } from '../../shared/components/modal/modal';
import { ReviewsModalComponent } from './guest-review-modal/guest-review-modal';

@Component({
  selector: 'app-guest-reviews',
  standalone: true,
  imports: [
    CommonModule,
    StarComponent,
    //ReviewsModalComponent ,
    Confirm,
    Modal,
    ReviewsModalComponent,
  ],
  templateUrl: './guest-reviews.html',
  styleUrl: './guest-reviews.css',
})
export class GuestReviews implements OnInit {
  @Input() propertyId?: number;
  // @Input() propertyName: string = 'This Property';
  //@Input() userbookings: any[] = [];

  currentUser: any = null;

  // reviews: Ireview[] = [];
  reviews: IGuestReviewDto[] = [];
  showReviewsModal: boolean = false;

  // userExistingReview: boolean = false;

  userBookings: BookingDetailsDTO[] = [];

  currentBookingId = 0;

  showTooltip: boolean = false;

  isLoadingBookings: boolean = false;

  showReviewForm = false; //  for performance optimization only i think

  constructor(
    private confirmService: ConfirmService,
    private ReviewService: ReviewService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    private UserBookingService: UserBookingService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.userId;

    // this.loadUserCompletedBookings();

    if (this.propertyId) {
      this.loadReviewsByPropertyId();

      if (this.currentUser) {
        //this.checkUserReviewEligibility();
        this.loadUserBookings();
      }
    }

    // else {
    //   this.loadAllReviews();
    // }
  }

  getOverallRating(): number {
    if (this.reviews.length === 0) return 0;
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    return totalRating / this.reviews.length;
  }

  openReviewsModal(): void {
    this.showReviewsModal = true;
  }

  closeReviewsModal(): void {
    this.showReviewsModal = false;
  }

  trackByReviewId(index: number, review: IGuestReviewDto): number {
    return review.id;
  }

  //first get user id
  // getCurrentUser(): any {
  //   const userId = this.authService.userId;
  //   return userId ? userId : null;
  // }

  loadUserBookings(): void {
    if (!this.currentUser) return;

    this.isLoadingBookings = true;
    this.UserBookingService.getBookingsByUserId(this.currentUser).subscribe({
      next: (bookings) => {
        this.userBookings = bookings;
        this.isLoadingBookings = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading user bookings:', error);
        this.isLoadingBookings = false;
      },
    });
  }

  //then check if there's one who booked show the review button
  // Check if user is logged in using AuthService
  shouldShowReviewButton(): boolean {
    // console.log('Checking if review button should be shown');

    if (!this.currentUser) {
      // console.log('No current user found.');
      return false;
    } else {
      console.log('Current user:', this.currentUser);
    }

    if (this.isLoadingBookings) {
      console.log('Bookings are still loading.');
      return false;
    } else {
      console.log('Bookings loaded:', this.userBookings);
    }

    const hasCompletedBooking = this.userBookings.some(
      (booking) =>
        booking.propertyId === this.propertyId &&
        booking.bookingStatus === 'Completed'
    );
    // console.log('Has completed booking for property:', hasCompletedBooking);

    if (!hasCompletedBooking) {
      return false;
    }

    const hasExistingReview = this.reviews.some(
      (review) => review.userId === this.currentUser
    );

    // console.log('Has existing review from user:', hasExistingReview);

    if (hasExistingReview) {
      return false;
    }

    // console.log('All checks passed. Show review button.');
    return true;
  }
  hasExistingReview(): boolean {
    console.log('Current User:', this.currentUser, typeof this.currentUser);
    console.log(
      'Reviews with userIds:',
      this.reviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        userIdType: typeof r.userId,
      }))
    );

    return this.reviews.some((review) => {
      const match = String(review.userId) === String(this.currentUser);
      console.log(
        `Comparing: "${review.userId}" === "${this.currentUser}" = ${match}`
      );
      return match;
    });
  }
  getCompletedBookingForProperty(): BookingDetailsDTO | null {
    return (
      this.userBookings
        .filter(
          (booking) =>
            booking.propertyId === this.propertyId &&
            booking.bookingStatus === 'Completed'
        )
        .sort(
          (a, b) =>
            new Date(b.checkOutDate).getTime() -
            new Date(a.checkOutDate).getTime()
        )[0] || null
    );
  }

  toggleTooltip(event: Event) {
    event.preventDefault();
    this.showTooltip = !this.showTooltip;

    if (this.showTooltip) {
      setTimeout(() => {
        document.addEventListener(
          'click',
          this.closeTooltipOnOutsideClick.bind(this)
        );
      }, 0);
    }
  }

  private closeTooltipOnOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.learn-container')) {
      this.showTooltip = false;
      this.cdr.detectChanges();
      document.removeEventListener(
        'click',
        this.closeTooltipOnOutsideClick.bind(this)
      );
    }
  }

  navigateToAddReview() {
    this.router.navigate(['/review/0'], {
      queryParams: {
        propertyId: this.propertyId,
        mode: 'add',
      },
    });
  }

  navigateToEditReview(reviewId: number) {
    this.router.navigate(['/review', reviewId], {
      queryParams: {
        mode: 'edit',
      },
    });
  }

  loadReviewsByPropertyId(): void {
    if (!this.propertyId) return;

    this.ReviewService.getReviewsByPropertyId(this.propertyId!).subscribe({
      next: (response) => {
        console.log('Reviews data :::::::::::::::::::::::::::::::::', response); // Debug line

        this.reviews = response;
        // this.checkUserExistingReview();
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error('Error loading reviews:', e);
      },
    });
  }

  // loadAllReviews(): void {
  //   this.ReviewService.getAllReviews().subscribe({
  //     next: (response) => {
  //       this.reviews = response;
  //       this.cdr.detectChanges();
  //     },
  //     error: (e) => {
  //       console.log(e);
  //     },
  //   });
  // }
  performDelete(reviewId: number) {
    this.ReviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((review) => review.id !== reviewId);
        // this.userExistingReview = false;
        // Recheck eligibility after deletion
        // this.checkUserReviewEligibility();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Delete failed:', error);
      },
    });
  }

  deleteHandler(reviewId: number) {
    this.confirmService.show(
      'Delete Your Review?',
      'Are you sure you want to delete this review? This action cannot be undone.',
      () => this.performDelete(reviewId),
      {
        okText: 'Delete',
        cancelText: 'Cancel',
        isSuccess: false,
      }
    );
  }

  //   isCurrentUserReview(review: IGuestReviewDto): boolean {
  //   return this.currentUser === review.UserId;
  // }

  // Optional: Get user profile link for now after the profile is made it won't be optional
  getUserProfileLink(userId: string): string {
    return `/user/${userId}`;
  }

  // Helper methods for user display
  getInitials(firstName?: string, lastName?: string): string {
    if (!firstName && !lastName) {
      return 'U'; // Default for unknown user
    }

    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';

    return firstInitial + lastInitial;
  }

  getFullName(firstName?: string, lastName?: string): string {
    if (!firstName && !lastName) {
      return 'Anonymous User';
    }

    return `${firstName || ''} ${lastName || ''}`.trim();
  }

  //Aggregate ratings for the property

  getRatingPercentage(rating: number): number {
    // Calculate percentage based on rating distribution
    const total = this.reviews.length;
    const count = this.reviews.filter(
      (r) => Math.floor(r.rating) === rating
    ).length;
    return total > 0 ? (count / total) * 100 : 0;
  }

  get ratingDistribution(): { [key: number]: number } {
    const distribution: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = this.reviews.filter(
        (r) => Math.floor(r.rating) === i
      ).length;
    }
    return distribution;
  }

  get categoryAverages(): { [key: string]: number } {
    if (this.reviews.length === 0) return {};

    const categories = [
      'cleanliness',
      'accuracy',
      'checkIn',
      'communication',
      'location',
      'value',
    ];
    const averages: { [key: string]: number } = {};

    categories.forEach((category) => {
      const sum = this.reviews.reduce(
        (acc, review) =>
          acc + (review[category as keyof IGuestReviewDto] as number),
        0
      );
      averages[category] = sum / this.reviews.length;
    });

    return averages;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      cleanliness: 'bi-house-check',
      accuracy: 'bi-check-circle',
      checkIn: 'bi-key',
      communication: 'bi-chat-dots',
      location: 'bi-geo-alt',
      value: 'bi-currency-dollar',
    };
    return icons[category] || 'bi-star';
  }
}

// loadUserCompletedBookings(): void {
//   if (!this.userId || !this.propertyId) return;

//   this.ReviewService.getUserCompletedBookingsForProperty(
//     this.userId,
//     this.propertyId
//   ).subscribe({
//     next: (bookings) => {
//       this.userCompletedBookings = bookings;
//       this.cdr.detectChanges();
//     },
//     error: (error) => {
//       console.error('Error loading user bookings:', error);
//     },
//   });
// }

// // Helper method for tracking reviews in ngFor
// trackByReviewId(index: number, review: Ireview): number {
//   return review.Id;
// }
// onReviewSubmitted(): void {
//   this.showReviewForm = false;
//   this.currentBookingId = 0;
//   this.loadReviews(); // Refresh the reviews list
//   // Optional: Show success message
//   console.log('Review submitted successfully!');
// }

// onReviewFormClosed(): void {
//   this.showReviewForm = false;
//   this.currentBookingId = 0;
// }

// openReviewForm(): void {
//   const completedBooking = this.getCompletedBookingForProperty();

//   if (completedBooking && !this.hasExistingReview()) {
//     this.currentBookingId = completedBooking.id;
//     this.showReviewForm = true;
//   }
// }

//MY NEW CODE
// shouldShowReviewButton(): boolean {
//   if (!this.currentUser) {
//     return false;
//   }

//   return true;
// }

// openReviewsModal() {
//   this.showReviewsModal = true;
// }

// closeReviewsModal() {
//   this.showReviewsModal = false;
// }
// Check if user can review using the backend endpoint
// checkUserReviewEligibility(): void {
//   if (!this.userId || !this.propertyId) return;

//   this.ReviewService.canUserReview(this.propertyId).subscribe({
//     next: (canReview) => {
//       this.canUserReview = canReview;
//       this.cdr.detectChanges();
//     },
//     error: (error) => {
//       console.error('Error checking review eligibility:', error);
//       this.canUserReview = false;
//     },
//   });
// }

// Check if user has already reviewed this property
// checkUserExistingReview(): void {
//   if (!this.userId || !this.propertyId) return;

//   this.userExistingReview = this.reviews.some(
//     (review) => review.UserId === this.userId
//   );

//   // Update canUserReview based on existing review
//   if (this.userExistingReview) {
//     this.canUserReview = false;
//   }
// }

// getFullName(firstName?: string, lastName?: string): string {
//   if (firstName || lastName) {
//     return `${firstName || ''} ${lastName || ''}`.trim() || 'Anonymous User';
//   }

//   // Fallback to current user info from localStorage
//   const storedUser = localStorage.getItem('user');
//   if (!storedUser) return 'Anonymous User';

//   const user = JSON.parse(storedUser);
//   return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User';
// }

//   // Add this method that seems to be missing from your template
//   getStarArray(rating: number): ('full' | 'half' | 'empty')[] {
//     const stars: ('full' | 'half' | 'empty')[] = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;

//     for (let i = 0; i < 5; i++) {
//       if (i < fullStars) {
//         stars.push('full');
//       } else if (i === fullStars && hasHalfStar) {
//         stars.push('half');
//       } else {
//         stars.push('empty');
//       }
//     }

//     return stars;
//   }

//   // Calculate overall rating for the main section
//   getOverallRating(): number {
//     if (this.reviews.length === 0) return 0;

//     const validRatings = this.reviews.filter(
//       (r) => r.Rating != null && !isNaN(r.Rating)
//     );

//     if (validRatings.length === 0) return 0;

//     const totalRating = validRatings.reduce(
//       (sum, review) => sum + review.Rating,
//       0
//     );

//     return Math.round((totalRating / validRatings.length) * 10) / 10;
//   }

//   // Calculate category averages for the main section
//   getCategoryAverage(category: keyof Ireview): number {
//     if (this.reviews.length === 0) return 0;

//     const validReviews = this.reviews.filter(
//       (r) =>
//         r[category] != null &&
//         !isNaN(r[category] as number) &&
//         (r[category] as number) >= 0
//     );

//     if (validReviews.length === 0) return 0;

//     const total = validReviews.reduce(
//       (sum, r) => sum + (r[category] as number),
//       0
//     );

//     return Math.round((total / validReviews.length) * 10) / 10;
//   }

//   // Get rating percentage for a specific star rating
//   getRatingPercentage(rating: number): number {
//     if (this.reviews.length === 0) return 0;

//     const count = this.reviews.filter(
//       (r) =>
//         r.Rating != null && !isNaN(r.Rating) && Math.round(r.Rating) === rating
//     ).length;

//     return Math.round((count / this.reviews.length) * 100);
//   }
