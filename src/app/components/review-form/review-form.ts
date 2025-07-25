import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Review } from '../../core/models/Review';
import { StarComponent } from '../../shared/components/star-component/star-component';
import { AuthService } from '../../core/services/auth.service';
import { AddReviewByGuestDTO } from '../../core/models/ReviewInterfaces/add-review-by-guest-dto';
import { ReviewService } from '../../core/services/Review/review.service';
import { BookingDetailsDTO } from '../../core/services/Booking/user-booking-service';

@Component({
  selector: 'app-review-form',
  imports: [ReactiveFormsModule, CommonModule, StarComponent],
  templateUrl: './review-form.html',
  styleUrl: './review-form.css',
})
export class ReviewForm implements OnInit {
  reviewId: number = 0;
  propertyId: number = 0;
  mode: 'add' | 'edit' | 'view' = 'add';
  propertyName: string = '';

  // Multi-step form
  currentStep: number = 1;
  totalSteps: number = 2;

  // User bookings for dropdown (only for add mode)
  userCompletedBookings: BookingDetailsDTO[] = [];

  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private reviewService: ReviewService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  userId: string | null = null;

  ngOnInit(): void {
    this.userId = this.authService.userId;

    // Check if we're in add mode with query parameters
    this.activatedRoute.queryParams.subscribe({
      next: (queryParams) => {
        if (queryParams['propertyId']) {
          this.propertyId = Number(queryParams['propertyId']);
          this.mode = queryParams['mode'] || 'add';
        }
      },
    });

    // Check if we're in edit/view mode with route parameters
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        if (id && id !== '0') {
          this.reviewId = Number(id);
          // Determine mode from route
          const routeMode =
            this.activatedRoute.snapshot.url[
              this.activatedRoute.snapshot.url.length - 1
            ]?.path;
          this.mode =
            routeMode === 'edit'
              ? 'edit'
              : routeMode === 'view'
              ? 'view'
              : 'add';
        }

        // Reset form for new review
        if (this.reviewId === 0) {
          this.resetForm();
        }
      },
      error: (err) => console.log(err),
    });

    // Load existing review data for edit/view mode
    if (this.reviewId !== 0) {
      this.loadExistingReview();
    } else if (this.mode === 'add' && this.propertyId) {
      // Load user's completed bookings for this property
      this.loadUserCompletedBookingsForProperty();
    }

    // Disable form in view mode
    if (this.mode === 'view') {
      this.reviewForm.disable();
    }
  }

  reviewForm = new FormGroup({
    bookingId: new FormControl<number | null>(null, [Validators.required]), // Only for add mode
    comment: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(10),
    ]),
    privateComment: new FormControl<string>(''),
    rating: new FormControl<number>(0, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    cleanliness: new FormControl<number>(0, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    accuracy: new FormControl<number>(0, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    communication: new FormControl<number>(0, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    checkIn: new FormControl<number>(0, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    location: new FormControl<number>(0, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    value: new FormControl<number>(0, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
  });

  // Form getters
  get getComment() {
    return this.reviewForm.controls['comment'];
  }
  get getPrivateNote() {
    return this.reviewForm.controls['privateComment'];
  }
  get getRating() {
    return this.reviewForm.controls['rating'];
  }
  get getCleanliness() {
    return this.reviewForm.controls['cleanliness'];
  }
  get getAccuracy() {
    return this.reviewForm.controls['accuracy'];
  }
  get getCommunication() {
    return this.reviewForm.controls['communication'];
  }
  get getCheckIn() {
    return this.reviewForm.controls['checkIn'];
  }
  get getLocation() {
    return this.reviewForm.controls['location'];
  }
  get getValue() {
    return this.reviewForm.controls['value'];
  }
  get getBookingId() {
    return this.reviewForm.controls['bookingId'];
  }

  resetForm(): void {
    this.reviewForm.patchValue({
      bookingId: null,
      comment: '',
      privateComment: '',
      rating: 0,
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      checkIn: 0,
      location: 0,
      value: 0,
    });
  }

  loadExistingReview(): void {
    this.isLoading = true;
    this.reviewService.getReviewById(this.reviewId).subscribe({
      next: (response: AddReviewByGuestDTO) => {
        this.reviewForm.patchValue({
          comment: response.comment,
          privateComment: response.privateComment || '',
          rating: response.rating,
          cleanliness: response.cleanliness || 0,
          accuracy: response.accuracy || 0,
          communication: response.communication || 0,
          checkIn: response.checkIn || 0,
          location: response.location || 0,
          value: response.value || 0,
        });

        this.propertyId = response.propertyId || 0;
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.log(error);
        this.errorMessage = 'Failed to load review data';
        this.isLoading = false;
      },
    });
  }

  loadUserCompletedBookingsForProperty(): void {
    if (!this.userId || !this.propertyId) return;

    this.reviewService
      .getUserCompletedBookingsForProperty(this.userId, this.propertyId)
      .subscribe({
        next: (bookings) => {
          // Filter for completed bookings only
          this.userCompletedBookings = bookings.filter(
            (booking) => booking.bookingStatus === 'Completed'
          );

          // Auto-select the first booking if only one exists
          if (this.userCompletedBookings.length === 1) {
            this.getBookingId.setValue(this.userCompletedBookings[0].id);
          }
        },
        error: (error) => {
          console.error('Error loading user bookings:', error);
        },
      });
  }

  isCurrentStepValid(): boolean {
    if (this.currentStep === 1) {
      // Step 1: Check overall rating and category ratings
      return (
        this.getRating.valid &&
        (this.getRating.value ?? 0) > 0 &&
        this.getCleanliness.valid &&
        (this.getCleanliness.value ?? 0) > 0 &&
        this.getAccuracy.valid &&
        (this.getAccuracy.value ?? 0) > 0 &&
        this.getCommunication.valid &&
        (this.getCommunication.value ?? 0) > 0 &&
        this.getCheckIn.valid &&
        (this.getCheckIn.value ?? 0) > 0 &&
        this.getLocation.valid &&
        (this.getLocation.value ?? 0) > 0 &&
        this.getValue.valid &&
        (this.getValue.value ?? 0) > 0
      );
    } else if (this.currentStep === 2) {
      // Step 2: Check comment and booking selection (for add mode)
      const commentValid = this.getComment.valid;
      const bookingValid = this.mode === 'add' ? this.getBookingId.valid : true;
      return commentValid && bookingValid;
    }
    return false;
  }

  nextStep(): void {
    if (this.isCurrentStepValid() && this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  reviewHandler() {
    if (!this.reviewForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Create review data object
    const reviewData: AddReviewByGuestDTO = {
      propertyId: this.propertyId,
      bookingId: this.mode === 'add' ? this.getBookingId.value ?? 1 : 1, // Use existing bookingId for edit
      comment: this.getComment.value ?? '',
      privateComment: this.getPrivateNote.value ?? '',
      rating: this.getRating.value ?? 0,
      cleanliness: this.getCleanliness.value ?? 0,
      accuracy: this.getAccuracy.value ?? 0,
      communication: this.getCommunication.value ?? 0,
      checkIn: this.getCheckIn.value ?? 0,
      location: this.getLocation.value ?? 0,
      value: this.getValue.value ?? 0,
    };

    if (this.mode === 'add') {
      // Add new review
      this.reviewService.addReview(reviewData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Review submitted successfully!';
          setTimeout(() => {
            this.router.navigate(['/properties', this.propertyId]);
          }, 1500);
        },
        error: (error: any) => {
          console.log(error);
          this.isLoading = false;
          this.errorMessage = 'Failed to submit review. Please try again.';
        },
      });
    } else if (this.mode === 'edit') {
      // Edit existing review
      const editReviewData = {
        ...reviewData,
        id: this.reviewId,
      };

      this.reviewService.updateReview(this.reviewId, editReviewData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Review updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/properties', this.propertyId]);
          }, 1500);
        },
        error: (error: any) => {
          console.log(error);
          this.isLoading = false;
          this.errorMessage = 'Failed to update review. Please try again.';
        },
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.values(this.reviewForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  // Navigate back to property page
  goBack(): void {
    if (this.propertyId) {
      this.router.navigate(['/properties', this.propertyId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
