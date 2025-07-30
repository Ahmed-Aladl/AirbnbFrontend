import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Ireview } from '../../../core/models/ireview';
import { StarComponent } from '../../../shared/components/star-component/star-component';
import { AuthService } from './../../../core/services/auth.service';

@Component({
  selector: 'app-reviews-modal',
  imports: [CommonModule, FormsModule, StarComponent],
  templateUrl: './guest-review-modal.html',
  styleUrls: ['./guest-review-modal.css'],
})
export class ReviewsModalComponent implements OnInit, OnChanges {
  @Input() reviews: Ireview[] = [];
  @Input() propertyName: string = 'This Property';
  @Input() propertyId!: string;
  @Output() closeModal = new EventEmitter<void>();

  filteredReviews: Ireview[] = [];
  searchQuery: string = '';
  sortOption: string = 'most-relevant';
  canUserAddReview: boolean = false;
  errorMessage: string = '';

  showReviewForm = false;

  openAddReviewModal() {
    this.showReviewForm = true;
  }

  // Rating statistics
  overallRating: number = 0;
  totalReviews: number = 0;
  ratingCounts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  categoryAverages: {
    cleanliness: number;
    accuracy: number;
    communication: number;
    checkIn: number;
    location: number;
    value: number;
  } = {
    cleanliness: 0,
    accuracy: 0,
    communication: 0,
    checkIn: 0,
    location: 0,
    value: 0,
  };

  constructor(
    private authService: AuthService // Add other services as needed:
  ) // private reviewService: ReviewService
  {}

  ngOnInit() {
    this.calculateStatistics();
    this.filterReviews();
    this.checkUserCanReview();
  }

  ngOnChanges() {
    this.calculateStatistics();
    this.filterReviews();
  }

  private checkUserCanReview() {
    const userId = this.authService.userId;

    if (!userId || !this.propertyId) {
      this.canUserAddReview = false;
      return;
    }

    // Uncomment when reviewService is available
    // this.reviewService.getUserCompletedBookingsForProperty(userId, this.propertyId)
    //   .subscribe((bookings) => {
    //     this.canUserAddReview = bookings.length > 0;
    //   });
  }

  addReview(reviewData: any) {
    // Uncomment when reviewService is available and reviewForm is implemented
    // this.reviewService.addReview(reviewData).subscribe(
    //   (review) => {
    //     console.log('Review added', review);
    //     this.closeModal.emit();
    //     this.loadReviews(); // refresh reviews
    //   },
    //   (err) => {
    //     console.error(err);
    //     this.errorMessage = err.message || 'Failed to add review';
    //   }
    // );
  }

  calculateStatistics() {
    if (this.reviews.length === 0) {
      this.resetStatistics();
      return;
    }

    this.totalReviews = this.reviews.length;

    // Calculate overall rating
    const validRatings = this.reviews.filter(
      (r) => r.rating != null && !isNaN(r.rating)
    );
    if (validRatings.length > 0) {
      const totalRating = validRatings.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      this.overallRating =
        Math.round((totalRating / validRatings.length) * 10) / 10;
    }

    // Reset and calculate rating counts for overall review ratings only
    this.ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.reviews.forEach((review) => {
      if (review.rating != null && !isNaN(review.rating)) {
        const rating = Math.round(review.rating); // Round to nearest whole star
        if (rating >= 1 && rating <= 5) {
          this.ratingCounts[rating]++;
        }
      }
    });

    // Calculate category averages properly - FIXED: Include 0 ratings if they're valid
    const categories: (keyof typeof this.categoryAverages)[] = [
      'cleanliness',
      'accuracy',
      'communication',
      'checkIn',
      'location',
      'value',
    ];

    categories.forEach((category) => {
      const validReviews = this.reviews.filter(
        (r) =>
          r[category] != null &&
          !isNaN(r[category] as number) &&
          (r[category] as number) >= 0 // FIXED: Include 0 ratings (changed from > 0 to >= 0)
      );

      if (validReviews.length > 0) {
        const total = validReviews.reduce(
          (sum, r) => sum + (r[category] as number),
          0
        );
        this.categoryAverages[category] =
          Math.round((total / validReviews.length) * 10) / 10;
      } else {
        this.categoryAverages[category] = 0;
      }
    });
  }

  private resetStatistics() {
    this.totalReviews = 0;
    this.overallRating = 0;
    this.ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.categoryAverages = {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      checkIn: 0,
      location: 0,
      value: 0,
    };
  }

  filterReviews() {
    let filtered = [...this.reviews];

    // Apply search filter with null checks
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((review) => {
        const commentMatch =
          review.comment?.toLowerCase().includes(query) || false;
        const userMatch = review.user
          ? `${review.user.firstName} ${review.user.lastName}`
              ?.toLowerCase()
              .includes(query) || false
          : false;
        return commentMatch || userMatch;
      });
    }

    // Apply sorting with better date handling - FIXED: Oldest sort logic
    switch (this.sortOption) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Most recent first
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0; // FIXED: Use 0 instead of MAX_SAFE_INTEGER
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0; // FIXED: Use 0 instead of MAX_SAFE_INTEGER
          return dateA - dateB; // Oldest first, undefined dates last
        });
        break;
      case 'highest-rated':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'lowest-rated':
        filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      default: // most-relevant
        // For most relevant, prioritize recent reviews with higher ratings
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
    }

    this.filteredReviews = filtered;
  }

  onSearchChange() {
    this.filterReviews();
  }

  onSortChange() {
    this.filterReviews();
  }

  getRatingPercentage(rating: number): number {
    if (this.totalReviews === 0) {
      return 0;
    }
    return Math.round((this.ratingCounts[rating] / this.totalReviews) * 100);
  }

  getInitials(name: string = 'Guest'): string {
    if (!name || name.trim() === '') {
      return 'GU';
    }

    return name
      .trim()
      .split(' ')
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(dateString: string): string {
    if (!dateString) {
      return 'Date not available';
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    } catch (error) {
      return 'Invalid date';
    }
  }

  // Get the number of years a user has been on the platform
  getUserJoinYear(review: Ireview): number {
    // TODO: This should be implemented with actual user join date from backend
    // For now, return a default value
    return 2; // Default to 2 years
  }

  // Helper method for tracking reviews in ngFor
  trackByReviewId(index: number, review: Ireview): number {
    return review.id;
  }

  onClose() {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
